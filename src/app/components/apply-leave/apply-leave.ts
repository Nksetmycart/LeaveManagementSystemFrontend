import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-apply-leave',
  imports: [CommonModule],
  templateUrl: './apply-leave.html',
  styleUrl: './apply-leave.css',
})
export class ApplyLeave implements OnInit {
  currentDate: Date = new Date(2026, 6, 15); // Explicit start mapping matching image July 2026
  calendarCells: CalendarCell[] = [];
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Range Tracking Properties
  startDate: Date | null = null;
  endDate: Date | null = null;

  ngOnInit(): void {
    this.generateCalendar();
  }

  get currentMonthName(): string {
    return this.currentDate.toLocaleString('default', { month: 'long' });
  }

  get currentYear(): number {
    return this.currentDate.getFullYear();
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startOffset = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const cells: CalendarCell[] = [];

    // Fill preceding elements
    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }

    // Fill active month numbers
    for (let i = 1; i <= totalDays; i++) {
      cells.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Square grid boundary to matching 35 or 42 grids blocks
    const totalGridSize = cells.length > 35 ? 42 : 35;
    const remainingSlots = totalGridSize - cells.length;
    for (let i = 1; i <= remainingSlots; i++) {
      cells.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    this.calendarCells = cells;
  }

  /* -------------------------------------------------------------------------- */
  /* Selection Handling Engine Logic                                            */
  /* -------------------------------------------------------------------------- */
  onDateSelect(date: Date): void {
    // 1. If no start date or both dates are filled, clean state reset
    if (!this.startDate || (this.startDate && this.endDate)) {
      this.startDate = date;
      this.endDate = null;
    } 
    // 2. If start date is selected, evaluate position logic
    else if (this.startDate && !this.endDate) {
      if (date < this.startDate) {
        // Fall back pivot if user clicks a day prior to start point
        this.startDate = date;
      } else {
        this.endDate = date;
      }
    }
  }

  // Verification helper methods mapped inside structural loops
  isRangeStart(date: Date): boolean {
    return !!this.startDate && this.clearTime(date) === this.clearTime(this.startDate);
  }

  isRangeEnd(date: Date): boolean {
    return !!this.endDate && this.clearTime(date) === this.clearTime(this.endDate);
  }

  isInsideRange(date: Date): boolean {
    if (!this.startDate || !this.endDate) return false;
    const time = this.clearTime(date);
    return time > this.clearTime(this.startDate) && time < this.clearTime(this.endDate);
  }

  private clearTime(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  submitLeaveRequest(): void {
    console.log('Submitting processing range parameters:', { start: this.startDate, end: this.endDate });
  }
}

interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
}