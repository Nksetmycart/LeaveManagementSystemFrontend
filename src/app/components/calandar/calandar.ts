import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface LeaveStatus {
  employee: string;
  type: 'approved' | 'pending' | 'holiday' | 'sick';
  reason: string;
}

interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  statuses: LeaveStatus[];
}

@Component({
  selector: 'app-calandar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calandar.html',
  styleUrl: './calandar.css',
})
export class Calandar implements OnInit {
  currentDate: Date = new Date();
  calendarCells: CalendarCell[] = [];
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Structured Leave Data Store mapped cleanly by ISO Date string keys
  mockLeaveData: { [key: string]: LeaveStatus[] } = {
    '2026-07-01': [{ employee: 'Priya S.', type: 'approved', reason: 'Annual Vacation' }],
    '2026-07-06': [
      { employee: 'Amit R.', type: 'pending', reason: 'Casual Leave Request' },
      { employee: 'Rohan M.', type: 'sick', reason: 'Medical checkup' }
    ],
    '2026-07-09': [{ employee: 'Sneha W.', type: 'approved', reason: 'Maternity Tier' }],
    '2026-07-15': [{ employee: 'Independence Day', type: 'holiday', reason: 'Public Statutory Holiday' }],
    '2026-07-22': [{ employee: 'Vikram K.', type: 'approved', reason: 'Personal Leave' }]
  };

  ngOnInit(): void {
    this.generateCalendar();
  }

  get currentMonthName(): string {
    return this.currentDate.toLocaleString('default', { month: 'long' });
  }

  get currentYear(): number {
    return this.currentDate.getFullYear();
  }

  /**
   * Generates the entire grid layout representing the current active month view matrix
   */
  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startOffset = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const cells: CalendarCell[] = [];
    const today = new Date();

    // 1. Populate preceding buffer days from the previous month
    for (let i = startOffset - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      cells.push(this.createCellObj(prevDate, false, today));
    }

    // 2. Populate active days of the current target month
    for (let i = 1; i <= totalDays; i++) {
      const activeDate = new Date(year, month, i);
      cells.push(this.createCellObj(activeDate, true, today));
    }

    // 3. Populate suffix padding elements from the upcoming month to square the grid rows
    const totalGridSlots = cells.length > 35 ? 42 : 35;
    const remainingSlots = totalGridSlots - cells.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const nextDate = new Date(year, month + 1, i);
      cells.push(this.createCellObj(nextDate, false, today));
    }

    this.calendarCells = cells;
  }

  /**
   * Factory function mapping Date structures safely into standard template matrix targets
   */
  private createCellObj(date: Date, isCurrentMonth: boolean, today: Date): CalendarCell {
    // Zero out hours to calculate accurate, timezone-safe date-string keys (YYYY-MM-DD)
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString().split('T')[0];
    const todayISOTime = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];

    return {
      date,
      isCurrentMonth,
      isToday: localISOTime === todayISOTime,
      statuses: this.mockLeaveData[localISOTime] || []
    };
  }

  /**
   * Helper utility assigning specific Bootstrap background classes dependent on state metrics
   */
  getStatusClass(type: 'approved' | 'pending' | 'holiday' | 'sick'): string {
    switch (type) {
      case 'approved': return 'bg-approved';
      case 'pending': return 'bg-pending';
      case 'sick': return 'bg-sick';
      case 'holiday': return 'bg-holiday';
      default: return 'bg-light text-secondary';
    }
  }

  /**
   * Navigate backwards one month
   */
  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  /**
   * Navigate forwards one month
   */
  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  /**
   * Reset view state instantly back to the current active real-time day tracking index
   */
  goToToday(): void {
    this.currentDate = new Date();
    this.generateCalendar();
  }
}