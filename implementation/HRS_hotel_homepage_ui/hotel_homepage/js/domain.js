// domain層: 4-2クラス図のエンティティに相当するクラス群
class Customer {
  constructor(lastName, firstName, email, phone) {
    this.lastName = lastName;
    this.firstName = firstName;
    this.name = `${lastName} ${firstName}`.trim();
    this.email = email;
    this.phone = phone;
  }
}

class Room {
  constructor(roomNo, roomType, capacity, price, title, description) {
    this.roomNo = roomNo;
    this.roomType = roomType;
    this.capacity = capacity;
    this.price = price;
    this.title = title;
    this.description = description;
  }
}

class Reservation {
  constructor({ reservationNo, customer, roomType, checkInDate, checkOutDate, guestCount, notes }) {
    this.reservationNo = reservationNo;
    this.customer = customer;
    this.roomType = roomType;
    this.checkInDate = checkInDate;
    this.checkOutDate = checkOutDate;
    this.guestCount = Number(guestCount);
    this.notes = notes || "";
    this.status = "RESERVED";
    this.roomNo = "";
    this.createdAt = new Date().toISOString();
  }
}

class Stay {
  constructor(reservationNo, roomNo, checkInAt) {
    this.reservationNo = reservationNo;
    this.roomNo = roomNo;
    this.checkInAt = checkInAt || new Date().toISOString();
    this.checkOutAt = "";
  }
}

class AccommodationFee {
  static nights(checkInDate, checkOutDate) {
    const start = new Date(checkInDate + "T00:00:00");
    const end = new Date(checkOutDate + "T00:00:00");
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return Math.max(days, 1);
  }

  static calculate(roomPrice, checkInDate, checkOutDate) {
    const nights = AccommodationFee.nights(checkInDate, checkOutDate);
    const roomCharge = roomPrice * nights;
    const serviceFee = Math.round(roomCharge * 0.10);
    const tax = Math.round((roomCharge + serviceFee) * 0.10);
    return { nights, roomCharge, serviceFee, tax, total: roomCharge + serviceFee + tax };
  }
}

class Payment {
  constructor(reservationNo, amount) {
    this.paymentNo = "P" + Date.now();
    this.reservationNo = reservationNo;
    this.amount = amount;
    this.paidAt = new Date().toISOString();
  }
}
