import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { GetLeaveTypesList, LeaveService, ApplyLeaveRequestDto } from '../../services/leave-service';

interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
}

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './apply-leave.html',
  styleUrl: './apply-leave.css',
})
export class ApplyLeave implements OnInit {
  currentDate: Date = new Date(2026, 6, 15); 
  calendarCells: CalendarCell[] = [];
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  leaveTypesList: any[] = [];
  apiResponse!: GetLeaveTypesList;
  
  // Selection Range Targets
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Form Controls Models
  selectedDayType = 'full';
  leaveRequestModel: any = {
    leaveTypeId: '',
    reason: ''
  };
  isSubmitting = false;

  constructor(private leaveService: LeaveService, private authService: AuthService) {}

  ngOnInit(): void {
    this.generateCalendar();
    this.loadLeaveTypes();
  }

  loadLeaveTypes(): void {
    this.leaveService.GetLeaveTypes().subscribe({
      next: (response) => {
        this.apiResponse = response;
        this.leaveTypesList = response.data;
      },
      error: (error) => {
        console.error("Error Fetching Leave Types List from server:", error);
      }
    });
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

  onDateSelect(date: Date): void {
    if (!this.startDate || (this.startDate && this.endDate)) {
      this.startDate = date;
      this.endDate = null;
    } 
    else if (this.startDate && !this.endDate) {
      if (date < this.startDate) {
        this.startDate = date;
      } else {
        this.endDate = date;
      }
    }
  }

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

  submitLeaveRequest(form: NgForm): void {
    // Form verification guard includes verification of character bounds limit
    if (form.invalid || !this.startDate || !this.endDate || (this.leaveRequestModel.reason?.length > 150)) {
      console.error("Submission blocked: Form validation parameters metrics failed.");
      return;
    }

    const employeeId = this.authService.getEmployeeId();
    if (!employeeId) {
      console.error("Submission blocked: Active employee identity missing.");
      alert("Session error: Could not identify user details.");
      return;
    }

    this.isSubmitting = true;

    let numericHalfDayFlag = 0; 
    if (this.selectedDayType === 'half-first') numericHalfDayFlag = 1;
    if (this.selectedDayType === 'half-second') numericHalfDayFlag = 2;

    const formatLocalDateToISO = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}T00:00:00.000Z`;
    };

    const leaveRequestPayload: ApplyLeaveRequestDto = {
      leaveTypeId: this.leaveRequestModel.leaveTypeId,
      startDate: formatLocalDateToISO(this.startDate), 
      endDate: formatLocalDateToISO(this.endDate),     
      isHalfDay: numericHalfDayFlag,
      reason: this.leaveRequestModel.reason,
      submittedAt: new Date().toISOString()
    };

    this.leaveService.ApplyLeaveById(leaveRequestPayload, employeeId).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        alert("Leave request logged successfully.");
        this.startDate = null;
        this.endDate = null;
        form.resetForm({ dayType: 'full' });
      },
      error: (err) => {
        this.isSubmitting = false;
        alert(err?.error?.message || "An error occurred while transmitting your request.");
      }
    });
  }
}