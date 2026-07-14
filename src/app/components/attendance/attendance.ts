import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
}

type SelectionMode = 'single' | 'range';
type AttendanceType = 'Present' | 'WFH' | 'Half Day';

@Component({
  selector: 'app-attendance',
  imports: [CommonModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})

export class Attendance implements OnInit {
currentDate: Date = new Date(2026, 6, 15); // Explicit layout target July 2026
  calendarCells: CalendarCell[] = [];
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Selection Control Parameters Matrix
  selectionMode: SelectionMode = 'single';
  selectedDates: Set<string> = new Set<string>(); // Used for standard multi/single distinct picks
  rangeStart: Date | null = null;
  rangeEnd: Date | null = null;

  // Active Interactive Records Registry
  attendanceRecords: { [key: string]: AttendanceType } = {};

  // Display Metrics Structure Store
  stats = { present: 0, wfh: 0, halfDays: 0, totalHours: 0.0 };

  ngOnInit(): void {
    this.generateCalendar();
    this.recalculateDashboardStats();
  }

  get currentMonthName(): string {
    return this.currentDate.toLocaleString('default', { month: 'long' });
  }

  get currentYear(): number {
    return this.currentDate.getFullYear();
  }

  setSelectionMode(mode: SelectionMode): void {
    this.selectionMode = mode;
    this.clearSelection();
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startOffset = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const cells: CalendarCell[] = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }
    for (let i = 1; i <= totalDays; i++) {
      cells.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const totalGridSize = cells.length > 35 ? 42 : 35;
    const remainingSlots = totalGridSize - cells.length;
    for (let i = 1; i <= remainingSlots; i++) {
      cells.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    this.calendarCells = cells;
  }

  /* -------------------------------------------------------------------------- */
  /* Selection Processing Engine Core Functions                                 */
  /* -------------------------------------------------------------------------- */
  handleCellSelection(date: Date): void {
    const dateKey = this.getDateKey(date);

    if (this.selectionMode === 'single') {
      // Toggle logic for single clicks
      if (this.selectedDates.has(dateKey)) {
        this.selectedDates.delete(dateKey);
        delete this.attendanceRecords[dateKey];
      } else {
        this.selectedDates.add(dateKey);
        // Defaults selection state assignment to Present log rule
        this.attendanceRecords[dateKey] = 'Present';
      }
    } 
    else if (this.selectionMode === 'range') {
      if (!this.rangeStart || (this.rangeStart && this.rangeEnd)) {
        this.rangeStart = date;
        this.rangeEnd = null;
      } else if (this.rangeStart && !this.rangeEnd) {
        if (date < this.rangeStart) {
          this.rangeStart = date;
        } else {
          this.rangeEnd = date;
          this.applyRangeAttendance();
        }
      }
    }

    this.recalculateDashboardStats();
  }

  private applyRangeAttendance(): void {
    if (!this.rangeStart || !this.rangeEnd) return;

    let current = new Date(this.rangeStart);
    while (current <= this.rangeEnd) {
      // Skip weekend allocations for standard default tracking logic
      if (current.getDay() !== 0 && current.getDay() !== 6) {
        const key = this.getDateKey(current);
        this.attendanceRecords[key] = 'Present';
      }
      current.setDate(current.getDate() + 1);
    }
  }

  recalculateDashboardStats(): void {
    let p = 0; let w = 0; let h = 0;
    
    Object.keys(this.attendanceRecords).forEach(key => {
      const type = this.attendanceRecords[key];
      if (type === 'Present') p++;
      else if (type === 'WFH') w++;
      else if (type === 'Half Day') h++;
    });

    this.stats.present = p;
    this.stats.wfh = w;
    this.stats.halfDays = h;
    // Evaluates standard formula base metrics: 8 hours per full day, 4 hours per half day
    this.stats.totalHours = (p * 8.0) + (w * 8.0) + (h * 4.0);
  }

  // Verification Helper Flag Engines
  isDateSelected(date: Date): boolean {
    return this.selectedDates.has(this.getDateKey(date));
  }

  isDateRangeCap(date: Date): boolean {
    if (!this.rangeStart) return false;
    const time = this.clearTime(date);
    return time === this.clearTime(this.rangeStart) || (!!this.rangeEnd && time === this.clearTime(this.rangeEnd));
  }

  isDateInsideRange(date: Date): boolean {
    if (!this.rangeStart || !this.rangeEnd) return false;
    const time = this.clearTime(date);
    return time > this.clearTime(this.rangeStart) && time < this.clearTime(this.rangeEnd);
  }

  clearSelection(): void {
    this.selectedDates.clear();
    this.rangeStart = null;
    this.rangeEnd = null;
    this.attendanceRecords = {};
    this.recalculateDashboardStats();
  }

  getDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private clearTime(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }

  getRecordBadgeClass(type: AttendanceType): string {
    switch (type) {
      case 'Present': return 'status-pill bg-present';
      case 'WFH': return 'status-pill bg-wfh';
      case 'Half Day': return 'status-pill bg-half';
      default: return 'status-pill bg-light text-muted';
    }
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  // Helper to check if any active selection parameters exist across modes
hasSelections(): boolean {
  if (this.selectionMode === 'single') {
    return this.selectedDates.size > 0;
  } else {
    return !!this.rangeStart;
  }
}

// Method triggered when clicking the "Send Attendance Request" button
submitAttendance(): void {
  const payload = {
    mode: this.selectionMode,
    timestamp: new Date(),
    details: this.attendanceRecords
  };
  
  console.log('Sending Mark Attendance HTTP Payload Request:', payload);
  alert(`Attendance request successfully sent for ${Object.keys(this.attendanceRecords).length} day(s)!`);
}
}
