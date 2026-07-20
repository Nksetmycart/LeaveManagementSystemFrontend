import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { GetLeaveTypesList, LeaveService, ApplyLeaveRequestDto } from '../../services/leave-service';
import { HolidayService, HolidaysList } from '../../services/holiday-service';
import { AttendanceService, AttendanceListResponse } from '../../services/attendance-service';
import { forkJoin } from 'rxjs';

interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
  isHoliday: boolean;
  holidayName?: string;
  attendanceStatus?: string;
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
  
  holidaysCache: any[] = [];
  attendanceCache: any[] = [];

  startDate: Date | null = null;
  endDate: Date | null = null;

  selectedDayType = 'full';
  leaveRequestModel: any = {
    leaveTypeId: '',
    reason: ''
  };
  
  isSubmitting = false;
  isLoadingMetadata = false;
  
  notification = {
    show: false,
    message: '',
    isSuccess: true
  };

  constructor(
    private leaveService: LeaveService, 
    private authService: AuthService,
    private holidayService: HolidayService,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit(): void {
    this.loadLeaveTypes();
    this.loadCalendarMetadataMetrics();
  }

  loadLeaveTypes(): void {
    this.leaveService.GetLeaveTypes().subscribe({
      next: (response) => {
        this.apiResponse = response;
        this.leaveTypesList = response.data;
      },
      error: (error) => {
        console.error("Error Fetching Leave Types List:", error);
      }
    });
  }

  loadCalendarMetadataMetrics(): void {
    const employeeId = this.authService.getEmployeeId();
    if (!employeeId) return;

    this.isLoadingMetadata = true;
    
    forkJoin({
      holidays: this.holidayService.GetHolidays(),
      attendance: this.attendanceService.GetAttendanceByEmployee(employeeId)
    }).subscribe({
      next: (results: { holidays: HolidaysList, attendance: AttendanceListResponse }) => {
        this.holidaysCache = results.holidays?.data || [];
        this.attendanceCache = results.attendance?.data || [];
        this.generateCalendar();
        this.isLoadingMetadata = false;
      },
      error: (err) => {
        console.error("Failed to map dynamic calendar metadata profiles:", err);
        this.isLoadingMetadata = false;
        this.generateCalendar();
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
      const d = new Date(year, month, -i);
      cells.push(this.buildCalendarCellMeta(d, false));
    }

    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      cells.push(this.buildCalendarCellMeta(d, true));
    }

    const totalGridSize = cells.length > 35 ? 42 : 35;
    const remainingSlots = totalGridSize - cells.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const d = new Date(year, month + 1, i);
      cells.push(this.buildCalendarCellMeta(d, false));
    }

    this.calendarCells = cells;
  }

  private buildCalendarCellMeta(date: Date, isCurrentMonth: boolean): CalendarCell {
    const checkTime = this.clearTime(date);
    
    const matchedHoliday = this.holidaysCache.find(h => this.clearTime(new Date(h.date)) === checkTime);
    const matchedAttendance = this.attendanceCache.find(a => this.clearTime(new Date(a.attendanceDate)) === checkTime);

    return {
      date: date,
      isCurrentMonth: isCurrentMonth,
      isHoliday: !!matchedHoliday,
      holidayName: matchedHoliday ? matchedHoliday.name : undefined,
      attendanceStatus: matchedAttendance ? matchedAttendance.status : undefined
    };
  }

  onDateSelect(cell: CalendarCell): void {
    // SELECTION BLOCKS GATEKEEPER: Not disabled visually, but intercepted here on action trigger
    if (cell.isHoliday) {
      this.triggerToastNotification(`Selection Rejected: Cannot select an official corporate holiday [${cell.holidayName}].`, false);
      return;
    }

    if (cell.attendanceStatus) {
      this.triggerToastNotification(`Selection Rejected: Cannot request time off on a date marked as [${cell.attendanceStatus}].`, false);
      return;
    }

    const date = cell.date;

    if (!this.startDate || (this.startDate && this.endDate)) {
      this.startDate = date;
      this.endDate = null;
    } 
    else if (this.startDate && !this.endDate) {
      if (date < this.startDate) {
        this.startDate = date;
      } else {
        if (this.containsBlockedRangeMetadata(this.startDate, date)) {
          this.triggerToastNotification("Range Selection Blocked: Active metadata bounds exist inside this timeline.", false);
          return;
        }
        this.endDate = date;
      }
    }
  }

  private containsBlockedRangeMetadata(start: Date, end: Date): boolean {
    const startTime = this.clearTime(start);
    const endTime = this.clearTime(end);

    const hasHoliday = this.holidaysCache.some(h => {
      const hTime = this.clearTime(new Date(h.date));
      return hTime >= startTime && hTime <= endTime;
    });

    const hasAttendance = this.attendanceCache.some(a => {
      const aTime = this.clearTime(new Date(a.attendanceDate));
      return aTime >= startTime && aTime <= endTime;
    });

    return hasHoliday || hasAttendance;
  }

  // Maps clean styling themes based on your exact text definitions rules
  getAttendanceThemeClass(status: string): string {
    if (!status) return '';
    const cleanStr = status.trim().toLowerCase();
    
    switch(cleanStr) {
      case 'working':   return 'bg-theme-working';
      case 'leave':     return 'bg-theme-leave';
      case 'firsthalf': return 'bg-theme-firsthalf';
      case 'secondhalf':return 'bg-theme-secondhalf';
      default:          return 'bg-light text-secondary border';
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

  triggerToastNotification(msg: string, isSuccess: boolean): void {
    this.notification = { show: true, message: msg, isSuccess: isSuccess };
    setTimeout(() => { this.dismissNotification(); }, 5000);
  }

  dismissNotification(): void {
    this.notification.show = false;
  }

  submitLeaveRequest(form: NgForm): void {
    if (form.invalid || !this.startDate || !this.endDate || (this.leaveRequestModel.reason?.length > 150)) {
      this.triggerToastNotification("Form input constraints validation failed.", false);
      return;
    }

    const employeeId = this.authService.getEmployeeId();
    if (!employeeId) {
      this.triggerToastNotification("Session trace variable index key mismatch.", false);
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
        this.triggerToastNotification("Leave request logged successfully.", true);
        this.startDate = null;
        this.endDate = null;
        form.resetForm({ dayType: 'full' });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.triggerToastNotification(err?.error?.message || "Time off request validation execution failed.", false);
      }
    });
  }
}