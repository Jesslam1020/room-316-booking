// Environment variables injected by Netlify
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class Room316ReservationSystem {
  constructor() {
    this.timeSlots = [
      "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00",
      "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"
    ];
    this.workDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    this.dateRange = {
      start: new Date("2025-09-01"),
      end: new Date("2026-08-31")
    };

    this.bookings = [];
    this.selectedDate = null;
    this.nextBookingId = null;

    this.init();
  }

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.setupRealtimeSubscription();
    this.loadBookings();
    this.renderCalendar(new Date());
  }

  cacheDOM() {
    this.calendarDays = document.getElementById("calendar-days");
    this.currentMonthEl = document.getElementById("current-month");
    this.prevBtn = document.getElementById("prev-month");
    this.nextBtn = document.getElementById("next-month");

    this.timeSlotSelect = document.getElementById("time-slot");
    this.staffInput = document.getElementById("staff-name");
    this.remarksInput = document.getElementById("remarks");
    this.bookingForm = document.getElementById("booking-form");

    this.bookingsTable = document.getElementById("bookings-table").querySelector("tbody");
  }

  bindEvents() {
    this.prevBtn.addEventListener("click", () => this.changeMonth(-1));
    this.nextBtn.addEventListener("click", () => this.changeMonth(1));
    this.calendarDays.addEventListener("click", e => {
      if (e.target.classList.contains("day") && !e.target.classList.contains("disabled")) {
        this.selectDate(e.target.dataset.date
