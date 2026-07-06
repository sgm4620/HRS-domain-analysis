// presentation層: 画面表示と入力イベントを担当する
const db = Database;
db.init();
const reservationManager = new ReservationManager(db);
const roomManager = new RoomManager(db, reservationManager);
const paymentManager = new PaymentManager(db);
const reserveControl = new ReserveRoomControl(reservationManager);
const checkInControl = new CheckInRoomControl(db, reservationManager, roomManager);
const checkOutControl = new CheckOutRoomControl(db, reservationManager, roomManager, paymentManager);

const $ = id => document.getElementById(id);

const RoomPresentation = {
  STANDARD: {
    type: "STANDARD",
    title: "Standard Twin",
    jpTitle: "スタンダード ツイン",
    image: "assets/room-standard.webp",
    desc: "木の温もりと柔らかな照明を基調にした、落ち着きのある標準客室。",
    capacity: 2,
    price: 48000,
    tags: ["2名まで", "ワークデスク", "静かな滞在"]
  },
  DELUXE: {
    type: "DELUXE",
    title: "Deluxe King",
    jpTitle: "デラックス キング",
    image: "assets/room-deluxe.webp",
    desc: "大きな窓とソファスペースを備えた、記念日にも合う上質な客室。",
    capacity: 3,
    price: 88000,
    tags: ["3名まで", "ソファスペース", "記念日向け"]
  },
  SUITE: {
    type: "SUITE",
    title: "Executive Suite",
    jpTitle: "エグゼクティブ スイート",
    image: "assets/room-suite.webp",
    desc: "リビングを備えた、最上級の寛ぎを味わえるスイートルーム。",
    capacity: 4,
    price: 180000,
    tags: ["4名まで", "リビング付き", "最上位客室"]
  }
};
const roomTypes = [RoomPresentation.STANDARD, RoomPresentation.DELUXE, RoomPresentation.SUITE];

function setDefaultDates() {
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const after = new Date(today); after.setDate(today.getDate() + 2);
  const fmt = d => d.toISOString().slice(0,10);
  ["quickCheckIn", "checkInDate"].forEach(id => $(id).value = fmt(tomorrow));
  ["quickCheckOut", "checkOutDate"].forEach(id => $(id).value = fmt(after));
}

function routeTo(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.id === id));
  document.querySelectorAll(".nav button").forEach(b => b.classList.toggle("active", b.dataset.route === id));
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderAll();
}

function renderRooms() {
  $("roomCards").innerHTML = roomTypes.map(room => roomCardHtml(room)).join("");
  document.querySelectorAll(".reserve-room").forEach(button => {
    button.addEventListener("click", () => {
      selectRoomType(button.dataset.roomType);
      routeTo("reserve");
    });
  });
}

function roomCardHtml(room) {
  return `
    <article class="room-card reveal pop-card" style="--reveal-delay:${roomTypes.indexOf(room) * 110}ms">
      <div class="room-image" style="background-image:url('${room.image}')"></div>
      <div class="room-body">
        <p class="eyebrow">${roomTypeLabel(room.type)}</p>
        <h2>${room.title}</h2>
        <p>${room.desc}</p>
        <div class="room-meta">
          ${room.tags.map(t => `<span>${t}</span>`).join("")}
        </div>
        <div class="room-price">${yen(room.price)}〜 <small>/ 泊</small></div>
        <button class="primary wide reserve-room" data-room-type="${room.type}" type="button">この客室を予約</button>
      </div>
    </article>`;
}

function renderReserveRoomGallery() {
  $("reserveRoomGallery").innerHTML = roomTypes.map(room => `
    <article class="reserve-option reveal pop-card ${$("roomType").value === room.type ? "selected" : ""}" style="--reveal-delay:${roomTypes.indexOf(room) * 100}ms" data-room-type="${room.type}">
      <img src="${room.image}" alt="${room.jpTitle}の客室画像">
      <div class="reserve-option-body">
        <h3>${room.jpTitle}</h3>
        <p>${room.desc}</p>
        <div class="room-price">${yen(room.price)}〜 <small>/ 泊</small></div>
        <button class="ghost choose-room" data-room-type="${room.type}" type="button">この客室を選択</button>
      </div>
    </article>`).join("");
  document.querySelectorAll(".choose-room, .reserve-option").forEach(el => {
    el.addEventListener("click", () => selectRoomType(el.dataset.roomType));
  });
}

function selectRoomType(type) {
  $("roomType").value = type;
  renderReserveRoomGallery();
}

function renderReservations() {
  const items = reservationManager.list().slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (items.length === 0) {
    $("reservationTable").innerHTML = `<div class="result-box muted">予約はまだありません。</div>`;
    return;
  }
  $("reservationTable").innerHTML = `
    <table>
      <thead><tr><th>予約番号</th><th>氏名</th><th>客室</th><th>日程</th><th>人数</th><th>部屋</th><th>状態</th></tr></thead>
      <tbody>
      ${items.map(r => `
        <tr>
          <td><strong>${r.reservationNo}</strong></td>
          <td>${customerName(r.customer)}</td>
          <td>${roomTypeLabel(r.roomType)}</td>
          <td>${r.checkInDate} → ${r.checkOutDate}</td>
          <td>${r.guestCount}名</td>
          <td>${r.roomNo || "未割当"}</td>
          <td><span class="badge ${r.status}">${statusLabel(r.status)}</span></td>
        </tr>
      `).join("")}
      </tbody>
    </table>`;
}

function statusLabel(status) {
  return { RESERVED: "予約済", CHECKED_IN: "滞在中", CHECKED_OUT: "精算済" }[status] || status;
}

function showResult(id, html, type = "success") {
  const box = $(id);
  box.className = `result-box ${type}`;
  box.innerHTML = html;
}

function showError(id, error) {
  showResult(id, `<strong>エラー</strong><br>${error.message}`, "error");
}

function reservationSummary(reservation) {
  const sampleRoom = db.rooms().find(r => r.roomType === reservation.roomType);
  const fee = AccommodationFee.calculate(sampleRoom.price, reservation.checkInDate, reservation.checkOutDate);
  return `
    <strong>ご予約を承りました。</strong><br>
    予約番号: <strong>${reservation.reservationNo}</strong><br>
    お名前: ${customerName(reservation.customer)} 様<br>
    客室: ${roomTypeLabel(reservation.roomType)} / ${reservation.guestCount}名<br>
    日程: ${reservation.checkInDate} → ${reservation.checkOutDate}（${fee.nights}泊）<br>
    宿泊料目安: <strong>${yen(fee.total)}</strong><br>
    <button class="ghost copy-no" type="button" data-no="${reservation.reservationNo}">予約番号をチェックイン欄へ入れる</button>
  `;
}

function renderAll() {
  renderReserveRoomGallery();
  renderReservations();
  setupScrollAnimations();
}

function setupScrollAnimations() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  if (!("IntersectionObserver" in window)) {
    items.forEach(el => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  }, { threshold: 0.18 });
  items.forEach(el => observer.observe(el));
}

function setupHeroParallax() {
  window.addEventListener("scroll", () => {
    const hero = document.querySelector(".luxury-hero");
    if (!hero) return;
    const y = Math.min(window.scrollY * 0.14, 90);
    hero.style.backgroundPosition = `center calc(50% + ${y}px)`;
  }, { passive: true });
}

function setupEvents() {
  document.querySelectorAll("[data-route]").forEach(el => {
    el.addEventListener("click", () => routeTo(el.dataset.route));
    el.addEventListener("keydown", e => { if (e.key === "Enter") routeTo(el.dataset.route); });
  });

  $("quickSearchForm").addEventListener("submit", e => {
    e.preventDefault();
    $("checkInDate").value = $("quickCheckIn").value;
    $("checkOutDate").value = $("quickCheckOut").value;
    $("guestCount").value = $("quickGuests").value;
    if ($("quickRoomType").value !== "ANY") selectRoomType($("quickRoomType").value);
    routeTo("reserve");
  });

  $("roomType").addEventListener("change", () => renderReserveRoomGallery());

  $("reservationForm").addEventListener("submit", e => {
    e.preventDefault();
    try {
      const reservation = reserveControl.execute({
        lastName: $("customerLastName").value.trim(),
        firstName: $("customerFirstName").value.trim(),
        email: $("customerEmail").value.trim(),
        phone: $("customerPhone").value.trim(),
        checkInDate: $("checkInDate").value,
        checkOutDate: $("checkOutDate").value,
        guestCount: $("guestCount").value,
        roomType: $("roomType").value,
        notes: $("notes").value.trim()
      });
      showResult("reservationResult", reservationSummary(reservation));
      renderAll();
    } catch (error) { showError("reservationResult", error); }
  });

  $("reservationResult").addEventListener("click", e => {
    if (e.target.classList.contains("copy-no")) {
      $("checkInReservationNo").value = e.target.dataset.no;
      routeTo("front");
    }
  });

  $("checkInForm").addEventListener("submit", e => {
    e.preventDefault();
    try {
      const { reservation, room } = checkInControl.execute($("checkInReservationNo").value);
      showResult("checkInResult", `
        <strong>チェックインが完了しました。</strong><br>
        予約番号: ${reservation.reservationNo}<br>
        お客様: ${customerName(reservation.customer)} 様<br>
        割当部屋番号: <strong>${room.roomNo}</strong><br>
        客室: ${roomTypeLabel(room.roomType)}
      `);
      $("checkOutRoomNo").value = room.roomNo;
      renderAll();
    } catch (error) { showError("checkInResult", error); }
  });

  $("checkOutForm").addEventListener("submit", e => {
    e.preventDefault();
    try {
      const { reservation, room, fee, payment } = checkOutControl.execute($("checkOutRoomNo").value);
      showResult("checkOutResult", `
        <strong>チェックアウトが完了しました。</strong><br>
        お客様: ${customerName(reservation.customer)} 様<br>
        部屋番号: ${room.roomNo}<br>
        宿泊数: ${fee.nights}泊<br>
        室料: ${yen(fee.roomCharge)} / サービス料: ${yen(fee.serviceFee)} / 税: ${yen(fee.tax)}<br>
        宿泊料合計: <strong>${yen(fee.total)}</strong><br>
        支払番号: ${payment.paymentNo}
      `);
      renderAll();
    } catch (error) { showError("checkOutResult", error); }
  });

  $("lookupForm").addEventListener("submit", e => {
    e.preventDefault();
    const reservation = reservationManager.findByNo($("lookupReservationNo").value);
    if (!reservation) {
      showResult("lookupResult", "予約が見つかりません。", "error");
      return;
    }
    showResult("lookupResult", `
      <strong>予約詳細</strong><br>
      予約番号: ${reservation.reservationNo}<br>
      お客様: ${customerName(reservation.customer)} 様（${reservation.customer.email} / ${reservation.customer.phone}）<br>
      客室: ${roomTypeLabel(reservation.roomType)} / ${reservation.guestCount}名<br>
      日程: ${reservation.checkInDate} → ${reservation.checkOutDate}<br>
      部屋番号: ${reservation.roomNo || "未割当"}<br>
      状態: <span class="badge ${reservation.status}">${statusLabel(reservation.status)}</span><br>
      要望: ${reservation.notes || "なし"}
    `);
  });

  $("resetDataButton").addEventListener("click", () => {
    const no = db.resetReservations();
    showResult("lookupResult", `予約データを初期化しました。予約番号 <strong>${no}</strong> を作成済みです。`);
    $("lookupReservationNo").value = no;
    $("checkInReservationNo").value = no;
    renderAll();
  });
}

setDefaultDates();
renderRooms();
setupEvents();
setupHeroParallax();
renderAll();
routeTo("home");
