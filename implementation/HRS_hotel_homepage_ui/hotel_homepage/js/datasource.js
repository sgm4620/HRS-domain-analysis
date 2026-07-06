// datasource層: ブラウザlocalStorageを簡易データベースとして扱う
const StorageKey = {
  rooms: "hrs.rooms.v2",
  reservations: "hrs.reservations.v2",
  stays: "hrs.stays.v2",
  payments: "hrs.payments.v2",
  sequence: "hrs.sequence.v2"
};

const RoomCatalog = [
  new Room("1101", "STANDARD", 2, 48000, "Standard Twin", "木目と間接照明を基調にした、落ち着きある標準客室。"),
  new Room("1102", "STANDARD", 2, 48000, "Standard Twin", "ワークデスクと上質なベッドを備えた静かな客室。"),
  new Room("1103", "STANDARD", 2, 48000, "Standard Twin", "短期滞在にも使いやすい、洗練されたスタンダードルーム。"),
  new Room("2101", "DELUXE", 3, 88000, "Deluxe King", "広い窓辺とソファスペースを備えた、余裕ある上位客室。"),
  new Room("2102", "DELUXE", 3, 88000, "Deluxe King", "記念日やゆったりした滞在に向く、上品なデラックスルーム。"),
  new Room("2103", "DELUXE", 3, 88000, "Deluxe King", "ラウンジのようなくつろぎを感じられるプレミアム客室。"),
  new Room("3101", "SUITE", 4, 180000, "Executive Suite", "リビングスペースを備えた、特別な滞在向けのスイート。"),
  new Room("3102", "SUITE", 4, 180000, "Executive Suite", "最上級の寛ぎを味わえる、広々としたスイートルーム。")
];

const Database = {
  read(key, fallback) {
    const text = localStorage.getItem(key);
    if (!text) return fallback;
    try { return JSON.parse(text); } catch (e) { return fallback; }
  },
  write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  init() {
    if (!localStorage.getItem(StorageKey.rooms)) {
      this.write(StorageKey.rooms, RoomCatalog);
    }
    if (!localStorage.getItem(StorageKey.reservations)) this.write(StorageKey.reservations, []);
    if (!localStorage.getItem(StorageKey.stays)) this.write(StorageKey.stays, []);
    if (!localStorage.getItem(StorageKey.payments)) this.write(StorageKey.payments, []);
    if (!localStorage.getItem(StorageKey.sequence)) this.write(StorageKey.sequence, 1);
  },
  resetReservations() {
    Object.values(StorageKey).forEach(key => localStorage.removeItem(key));
    this.init();
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const after = new Date(today); after.setDate(today.getDate() + 3);
    const fmt = d => d.toISOString().slice(0,10);
    const sampleCustomer = new Customer("早稲田", "太郎", "taro@example.com", "090-1234-5678");
    const no = this.nextReservationNo();
    const reservation = new Reservation({
      reservationNo: no,
      customer: sampleCustomer,
      roomType: "DELUXE",
      checkInDate: fmt(tomorrow),
      checkOutDate: fmt(after),
      guestCount: 2,
      notes: "事前作成予約"
    });
    const reservations = this.reservations();
    reservations.push(reservation);
    this.saveReservations(reservations);
    return no;
  },
  rooms() { return this.read(StorageKey.rooms, RoomCatalog); },
  reservations() { return this.read(StorageKey.reservations, []); },
  stays() { return this.read(StorageKey.stays, []); },
  payments() { return this.read(StorageKey.payments, []); },
  saveReservations(items) { this.write(StorageKey.reservations, items); },
  saveStays(items) { this.write(StorageKey.stays, items); },
  savePayments(items) { this.write(StorageKey.payments, items); },
  nextReservationNo() {
    const seq = this.read(StorageKey.sequence, 1);
    this.write(StorageKey.sequence, seq + 1);
    const date = new Date().toISOString().slice(0,10).replaceAll("-", "");
    return `R${date}-${String(seq).padStart(3, "0")}`;
  }
};
