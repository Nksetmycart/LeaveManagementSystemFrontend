import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-component',
  imports: [CommonModule],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent implements OnInit {
  currentDate: Date = new Date();
  calendarCells: CalendarCell[] = [];
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Mock Data Store mapped to year 2026/2027 timelines
  mockLeaveData: { [key: string]: LeaveStatus[] } = {
    '2026-07-01': [{ employee: 'Priya S.', type: 'approved', reason: 'Annual Vacation' }],
    '2026-07-06': [
      { employee: 'Amit R.', type: 'pending', reason: 'Casual Leave Request' },
      { employee: 'Rohan M.', type: 'sick', reason: 'Medical checkup' }
    ],
    '2026-07-09': [{ employee: 'Sneha W.', type: 'approved', reason: 'Maternity Tier' }],
    '2026-07-15': [{ employee: 'National Day', type: 'holiday', reason: 'Public Statutory Holiday' }],
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

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startOffset = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const cells: CalendarCell[] = [];
    const today = new Date();

    // Populate dynamic prefix slots from the previous month
    for (let i = startOffset - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      cells.push(this.createCellObj(prevDate, false, today));
    }

    // Populate active days of the current month
    for (let i = 1; i <= totalDays; i++) {
      const activeDate = new Date(year, month, i);
      cells.push(this.createCellObj(activeDate, true, today));
    }

    // Populate suffix cells from the next month to square up the grid layout perfectly
    const totalGridSlots = 42; // standard 6-row layout matrix
    const remainingSlots = totalGridSlots - cells.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const nextDate = new Date(year, month + 1, i);
      cells.push(this.createCellObj(nextDate, false, today));
    }

    this.calendarCells = cells;
  }

  private createCellObj(date: Date, isCurrentMonth: boolean, today: Date): CalendarCell {
    const dateString = date.toISOString().split('T')[0];
    return {
      date,
      isCurrentMonth,
      isToday: dateString === today.toISOString().split('T')[0],
      statuses: this.mockLeaveData[dateString] || []
    };
  }

  getStatusClass(type: string): string {
    switch (type) {
      case 'approved': return 'bg-success-subtle text-success border border-success-subtle';
      case 'pending': return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'sick': return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'holiday': return 'bg-primary-subtle text-primary border border-primary-subtle';
      default: return 'bg-secondary-subtle text-secondary';
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

  goToToday(): void {
    this.currentDate = new Date();
    this.generateCalendar();
  }
}

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