// Room 316 Reservation System - JavaScript (Final Fixed Version)
class Room316ReservationSystem {
    constructor() {
        // Application data
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

        // In-memory database with sample bookings
        this.bookings = [
            {
                id: 1,
                date: "2025-09-01",
                timeSlot: "09:00",
                staffName: "Alice Wong",
                remarks: "Team meeting preparation"
            },
            {
                id: 2,
                date: "2025-09-01",
                timeSlot: "14:00",
                staffName: "Bob Chen",
                remarks: "Client presentation"
            },
            {
                id: 3,
                date: "2025-09-02",
                timeSlot: "10:30",
                staffName: "Carol Li",
                remarks: "Project review session"
            }
        ];

        // Current state
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTimeSlot = null;
        this.nextBookingId = 4;
        this.currentTab = 'booking'; // Track current tab

        // Initialize the application
        this.init();
    }

    init() {
        console.log('Initializing Room 316 Reservation System');
        this.bindEvents();
        this.showBookingSection();
        this.initializeCalendar();
        this.renderBookings();
        this.clearTimeSlots(); // Initialize empty time slots
    }

    bindEvents() {
        // Navigation events - Make sure we get all nav buttons
        const navButtons = document.querySelectorAll('.nav-btn');
        console.log('Found nav buttons:', navButtons.length);
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log('Nav button clicked:', e.target.dataset.tab);
                this.handleNavigation(e);
            });
        });

        // Calendar events
        document.getElementById('prev-month').addEventListener('click', () => this.navigateMonth(-1));
        document.getElementById('next-month').addEventListener('click', () => this.navigateMonth(1));

        // Booking form events
        document.getElementById('booking-form').addEventListener('submit', (e) => this.handleBookingSubmit(e));

        // Modal events
        document.getElementById('close-modal').addEventListener('click', () => this.hideModal());
        document.getElementById('make-another').addEventListener('click', () => {
            this.hideModal();
            this.resetBookingForm();
        });

        // Filter events
        document.getElementById('filter-date').addEventListener('change', () => this.filterBookings());
        document.getElementById('clear-filter').addEventListener('click', () => this.clearFilter());

        // Click outside modal to close
        document.getElementById('confirmation-modal').addEventListener('click', (e) => {
            if (e.target.id === 'confirmation-modal') {
                this.hideModal();
            }
        });

        console.log('Events bound successfully');
    }

    handleNavigation(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const tab = e.target.dataset.tab;
        console.log('Navigation clicked:', tab, 'Current tab:', this.currentTab);
        
        // Don't do anything if we're already on this tab
        if (this.currentTab === tab) {
            console.log('Already on tab:', tab);
            return;
        }
        
        // Update current tab
        this.currentTab = tab;
        
        // Update nav button states
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            // Reset button classes
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
                btn.classList.remove('btn--secondary');
                btn.classList.add('btn--primary');
            } else {
                btn.classList.remove('active');
                btn.classList.remove('btn--primary');
                btn.classList.add('btn--secondary');
            }
        });

        // Hide all sections first
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show the correct section
        if (tab === 'booking') {
            this.showBookingSection();
        } else if (tab === 'view') {
            this.showViewSection();
        }
        
        console.log('Navigation completed to:', tab);
    }

    showBookingSection() {
        console.log('Showing booking section');
        const bookingSection = document.getElementById('booking-section');
        const viewSection = document.getElementById('view-section');
        
        // Hide view section and show booking section
        viewSection.classList.remove('active');
        bookingSection.classList.add('active');
        
        this.currentTab = 'booking';
        this.initializeCalendar();
    }

    showViewSection() {
        console.log('Showing view section');
        const bookingSection = document.getElementById('booking-section');
        const viewSection = document.getElementById('view-section');
        
        // Hide booking section and show view section
        bookingSection.classList.remove('active');
        viewSection.classList.add('active');
        
        this.currentTab = 'view';
        this.renderBookings();
    }

    initializeCalendar() {
        this.renderCalendar();
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month header
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Get first Monday of calendar (may be from previous month)
        const startDate = new Date(firstDay);
        const dayOfWeek = firstDay.getDay();
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate.setDate(firstDay.getDate() - mondayOffset);

        // Clear and populate calendar
        const calendarDays = document.getElementById('calendar-days');
        calendarDays.innerHTML = '';

        // Generate 42 days (6 weeks)
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = date.getDate();
            dayElement.dataset.date = date.toISOString().split('T')[0];

            // Check if date is in current month
            if (date.getMonth() !== month) {
                dayElement.classList.add('other-month');
            } else {
                // Check if date is available (within range and working day)
                if (this.isDateAvailable(date)) {
                    dayElement.classList.add('available');
                    dayElement.addEventListener('click', () => this.selectDate(date));
                } else {
                    dayElement.classList.add('unavailable');
                }
            }

            // Highlight selected date
            if (this.selectedDate && date.toDateString() === this.selectedDate.toDateString()) {
                dayElement.classList.add('selected');
            }

            calendarDays.appendChild(dayElement);
        }
        console.log('Calendar rendered');
    }

    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    isDateAvailable(date) {
        // Check if date is within allowed range
        if (date < this.dateRange.start || date > this.dateRange.end) {
            return false;
        }

        // Check if it's a working day (Monday to Saturday)
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        return this.workDays.includes(dayName);
    }

    selectDate(date) {
        console.log('Date selected:', date);
        this.selectedDate = date;
        this.selectedTimeSlot = null; // Reset selected time slot
        
        // Format date for display
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        document.getElementById('selected-date').value = date.toLocaleDateString('en-GB', options);
        
        // Re-render calendar to show selection
        this.renderCalendar();
        
        // Update time slots
        this.renderTimeSlots();
    }

    clearTimeSlots() {
        const timeSlotsContainer = document.getElementById('time-slots');
        timeSlotsContainer.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--space-16);">Please select a date first</p>';
    }

    renderTimeSlots() {
        console.log('Rendering time slots for date:', this.selectedDate);
        const timeSlotsContainer = document.getElementById('time-slots');
        timeSlotsContainer.innerHTML = '';

        if (!this.selectedDate) {
            this.clearTimeSlots();
            return;
        }

        const dateString = this.selectedDate.toISOString().split('T')[0];
        const bookedSlots = this.getBookedSlotsForDate(dateString);
        console.log('Booked slots for', dateString, ':', bookedSlots);

        this.timeSlots.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = 'time-slot';
            slotElement.textContent = slot;
            slotElement.dataset.slot = slot;

            if (bookedSlots.includes(slot)) {
                slotElement.classList.add('booked');
                slotElement.title = 'This time slot is already booked';
            } else {
                slotElement.classList.add('available');
                slotElement.addEventListener('click', () => this.selectTimeSlot(slot, slotElement));
            }

            // Highlight selected slot
            if (this.selectedTimeSlot === slot) {
                slotElement.classList.add('selected');
            }

            timeSlotsContainer.appendChild(slotElement);
        });
        
        console.log('Time slots rendered:', this.timeSlots.length);
    }

    getBookedSlotsForDate(dateString) {
        return this.bookings
            .filter(booking => booking.date === dateString)
            .map(booking => booking.timeSlot);
    }

    selectTimeSlot(slot, element) {
        console.log('Time slot selected:', slot);
        
        // Remove selection from all slots
        document.querySelectorAll('.time-slot.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Add selection to clicked slot
        element.classList.add('selected');
        this.selectedTimeSlot = slot;
    }

    async handleBookingSubmit(e) {
        e.preventDefault();
        console.log('Form submitted');
        
        if (!this.validateBooking()) {
            return;
        }

        this.showLoading();

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const staffName = document.getElementById('staff-name').value.trim();
        const remarks = document.getElementById('remarks').value.trim() || 'No remarks';
        
        const booking = {
            id: this.nextBookingId++,
            date: this.selectedDate.toISOString().split('T')[0],
            timeSlot: this.selectedTimeSlot,
            staffName: staffName,
            remarks: remarks
        };

        this.bookings.push(booking);
        console.log('Booking created:', booking);
        
        this.hideLoading();
        this.showConfirmation(booking);
        this.renderTimeSlots(); // Refresh time slots to show new booking
    }

    validateBooking() {
        if (!this.selectedDate) {
            alert('Please select a date');
            return false;
        }

        if (!this.selectedTimeSlot) {
            alert('Please select a time slot');
            return false;
        }

        const staffName = document.getElementById('staff-name').value.trim();
        if (!staffName) {
            alert('Please enter your name');
            document.getElementById('staff-name').focus();
            return false;
        }

        // Check for conflicts
        const dateString = this.selectedDate.toISOString().split('T')[0];
        const isSlotTaken = this.bookings.some(booking => 
            booking.date === dateString && booking.timeSlot === this.selectedTimeSlot
        );

        if (isSlotTaken) {
            alert('This time slot is already booked. Please select another time.');
            return false;
        }

        return true;
    }

    showConfirmation(booking) {
        console.log('Showing confirmation modal for booking:', booking);
        const modal = document.getElementById('confirmation-modal');
        const details = document.getElementById('confirmation-details');
        
        const bookingDate = new Date(booking.date);
        const formattedDate = bookingDate.toLocaleDateString('en-GB', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        details.innerHTML = `
            <div class="booking-summary">
                <p><strong>📅 Date:</strong> ${formattedDate}</p>
                <p><strong>🕐 Time:</strong> ${booking.timeSlot}</p>
                <p><strong>👤 Staff:</strong> ${booking.staffName}</p>
                <p><strong>📝 Remarks:</strong> ${booking.remarks}</p>
                <p><strong>🏠 Room:</strong> Room 316</p>
            </div>
        `;

        modal.classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('confirmation-modal').classList.add('hidden');
    }

    resetBookingForm() {
        document.getElementById('booking-form').reset();
        document.getElementById('selected-date').value = '';
        this.selectedDate = null;
        this.selectedTimeSlot = null;
        this.clearTimeSlots();
        this.renderCalendar();
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    renderBookings() {
        console.log('Rendering bookings, total:', this.bookings.length);
        const container = document.getElementById('bookings-container');
        const filterDate = document.getElementById('filter-date').value;
        
        let filteredBookings = [...this.bookings];
        
        if (filterDate) {
            filteredBookings = filteredBookings.filter(booking => booking.date === filterDate);
        }

        // Sort by date and time
        filteredBookings.sort((a, b) => {
            const dateCompare = new Date(a.date) - new Date(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.timeSlot.localeCompare(b.timeSlot);
        });

        if (filteredBookings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No bookings found</h3>
                    <p>There are no reservations for the selected criteria.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        filteredBookings.forEach(booking => {
            const bookingElement = this.createBookingCard(booking);
            container.appendChild(bookingElement);
        });
        
        console.log('Bookings rendered:', filteredBookings.length);
    }

    createBookingCard(booking) {
        const card = document.createElement('div');
        card.className = 'booking-card';
        
        const bookingDate = new Date(booking.date);
        const formattedDate = bookingDate.toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        card.innerHTML = `
            <div class="booking-header">
                <div class="booking-date">${formattedDate}</div>
                <div class="booking-time">${booking.timeSlot}</div>
            </div>
            <div class="booking-staff">👤 ${booking.staffName}</div>
            <div class="booking-remarks">📝 ${booking.remarks}</div>
        `;

        return card;
    }

    filterBookings() {
        this.renderBookings();
    }

    clearFilter() {
        document.getElementById('filter-date').value = '';
        this.renderBookings();
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app');
    new Room316ReservationSystem();
});