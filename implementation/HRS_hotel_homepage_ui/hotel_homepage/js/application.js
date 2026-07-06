// application層: 予約・チェックイン・チェックアウトを制御するクラス群
function hasDateOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function yen(value) {
  return "¥" + Number(value).toLocaleString("ja-JP");
}

function roomTypeLabel(type) {
  return { STANDARD: "スタンダード", DELUXE: "デラックス", SUITE: "スイート", ANY: "指定なし" }[type] || type;
}

function customerName(customer) {
  if (!customer) return "";
  if (customer.name) return customer.name;
  return `${customer.lastName || ""} ${customer.firstName || ""}`.trim();
}

class ReservationManager {
  constructor(database) { this.database = database; }

  list() { return this.database.reservations(); }

  findByNo(reservationNo) {
    return this.list().find(r => r.reservationNo.toUpperCase() === reservationNo.trim().toUpperCase());
  }

  availableRooms(roomType, checkInDate, checkOutDate, guestCount, excludeReservationNo = "") {
    const activeReservations = this.list().filter(r => {
      if (r.status === "CHECKED_OUT") return false;
      if (excludeReservationNo && r.reservationNo === excludeReservationNo) return false;
      return hasDateOverlap(checkInDate, checkOutDate, r.checkInDate, r.checkOutDate);
    });

    // まず、条件に合う客室候補を取り出す。
    const candidateRooms = this.database.rooms().filter(room => {
      if (roomType !== "ANY" && room.roomType !== roomType) return false;
      return room.capacity >= Number(guestCount);
    });

    // すでに部屋番号が確定している予約は、その部屋だけを使用中にする。
    const usedRoomNos = new Set(
      activeReservations
        .filter(r => r.roomNo)
        .map(r => String(r.roomNo))
    );

    let freeRooms = candidateRooms.filter(room => !usedRoomNos.has(String(room.roomNo)));

    // まだ部屋番号が未割当の予約も、同じ日程の空室枠として数える。
    // ただし、チェックイン対象の予約自身は excludeReservationNo で除外する。
    const heldRoomNos = new Set();
    activeReservations
      .filter(r => !r.roomNo)
      .forEach(r => {
        const roomToHold = freeRooms.find(room => {
          if (heldRoomNos.has(String(room.roomNo))) return false;
          if (r.roomType !== "ANY" && room.roomType !== r.roomType) return false;
          return room.capacity >= Number(r.guestCount);
        });
        if (roomToHold) heldRoomNos.add(String(roomToHold.roomNo));
      });

    return freeRooms.filter(room => !heldRoomNos.has(String(room.roomNo)));
  }

  reserve(input) {
    this.validateDates(input.checkInDate, input.checkOutDate);
    const available = this.availableRooms(input.roomType, input.checkInDate, input.checkOutDate, input.guestCount);
    if (available.length === 0) throw new Error("指定条件で利用できる客室がありません。日付または客室種別を変更してください。");

    const reservation = new Reservation({
      reservationNo: this.database.nextReservationNo(),
      customer: new Customer(input.lastName, input.firstName, input.email, input.phone),
      roomType: input.roomType,
      checkInDate: input.checkInDate,
      checkOutDate: input.checkOutDate,
      guestCount: input.guestCount,
      notes: input.notes
    });
    const reservations = this.list();
    reservations.push(reservation);
    this.database.saveReservations(reservations);
    return reservation;
  }

  validateDates(checkInDate, checkOutDate) {
    if (!checkInDate || !checkOutDate) throw new Error("チェックイン日とチェックアウト日を入力してください。");
    if (checkOutDate <= checkInDate) throw new Error("チェックアウト日はチェックイン日より後にしてください。");
  }

  update(reservation) {
    const reservations = this.list().map(r => r.reservationNo === reservation.reservationNo ? reservation : r);
    this.database.saveReservations(reservations);
  }
}

class RoomManager {
  constructor(database, reservationManager) {
    this.database = database;
    this.reservationManager = reservationManager;
  }
  findRoom(roomNo) { return this.database.rooms().find(r => r.roomNo === String(roomNo).trim()); }
  findFirstAvailable(roomType, checkInDate, checkOutDate, guestCount, excludeReservationNo = "") {
    return this.reservationManager.availableRooms(roomType, checkInDate, checkOutDate, guestCount, excludeReservationNo)[0];
  }
}

class PaymentManager {
  constructor(database) { this.database = database; }
  calculateForReservation(reservation, room) {
    return AccommodationFee.calculate(room.price, reservation.checkInDate, reservation.checkOutDate);
  }
  pay(reservationNo, amount) {
    const payment = new Payment(reservationNo, amount);
    const payments = this.database.payments();
    payments.push(payment);
    this.database.savePayments(payments);
    return payment;
  }
}

class ReserveRoomControl {
  constructor(reservationManager) { this.reservationManager = reservationManager; }
  execute(input) { return this.reservationManager.reserve(input); }
}

class CheckInRoomControl {
  constructor(database, reservationManager, roomManager) {
    this.database = database;
    this.reservationManager = reservationManager;
    this.roomManager = roomManager;
  }
  execute(reservationNo) {
    const reservation = this.reservationManager.findByNo(reservationNo);
    if (!reservation) throw new Error("予約番号が見つかりません。");
    if (reservation.status === "CHECKED_IN") throw new Error(`すでにチェックイン済みです。部屋番号は ${reservation.roomNo} です。`);
    if (reservation.status === "CHECKED_OUT") throw new Error("この予約はすでにチェックアウト済みです。");
    const room = this.roomManager.findFirstAvailable(
      reservation.roomType,
      reservation.checkInDate,
      reservation.checkOutDate,
      reservation.guestCount,
      reservation.reservationNo
    );
    if (!room) throw new Error("割り当て可能な部屋がありません。");
    reservation.roomNo = room.roomNo;
    reservation.status = "CHECKED_IN";
    this.reservationManager.update(reservation);
    const stays = this.database.stays();
    stays.push(new Stay(reservation.reservationNo, room.roomNo));
    this.database.saveStays(stays);
    return { reservation, room };
  }
}

class CheckOutRoomControl {
  constructor(database, reservationManager, roomManager, paymentManager) {
    this.database = database;
    this.reservationManager = reservationManager;
    this.roomManager = roomManager;
    this.paymentManager = paymentManager;
  }
  execute(roomNo) {
    const reservation = this.reservationManager.list().find(r => r.roomNo === String(roomNo).trim() && r.status === "CHECKED_IN");
    if (!reservation) throw new Error("チェックイン中の予約が見つかりません。部屋番号を確認してください。");
    const room = this.roomManager.findRoom(roomNo);
    if (!room) throw new Error("部屋情報が見つかりません。");
    const fee = this.paymentManager.calculateForReservation(reservation, room);
    const payment = this.paymentManager.pay(reservation.reservationNo, fee.total);
    reservation.status = "CHECKED_OUT";
    this.reservationManager.update(reservation);
    const stays = this.database.stays().map(s => {
      if (s.reservationNo === reservation.reservationNo && !s.checkOutAt) s.checkOutAt = new Date().toISOString();
      return s;
    });
    this.database.saveStays(stays);
    return { reservation, room, fee, payment };
  }
}
