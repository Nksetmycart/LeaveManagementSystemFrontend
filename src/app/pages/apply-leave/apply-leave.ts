import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { LeaveService, ApplyLeaveRequestDto } from '../../services/leave-service';
import { HolidayService, HolidaysList } from '../../services/holiday-service';
import { AttendanceService, AttendanceListResponse } from '../../services/attendance-service';
import { forkJoin } from 'rxjs';

interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
  isHoliday: boolean;
  holidayName?: string;
  attendanceStatus?: string;
  isPastDate: boolean;
  isWeekend: boolean;
}

interface ToastConfig {
  show: boolean;
  message: string;
  isSuccess: boolean;
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
  
  allLeaveTypes: any[] = [];
  holidaysCache: any[] = [];
  attendanceCache: any[] = [];

  appMode: 'leave' | 'compoff' = 'leave';
  selectedTypeBalance: any = null;

  startDate: Date | null = null;
  endDate: Date | null = null;

  selectionMode: 'single' | 'range' = 'single';

  singleSessionOptions = [
    { label: 'Full Day', value: 0 },
    { label: 'First Half', value: 1 },
    { label: 'Second Half', value: 2 }
  ];

  startSessionOptions = [
    { label: 'Full Day', value: 0 },
    { label: 'Second Half', value: 2 }
  ];

  endSessionOptions = [
    { label: 'Full Day', value: 0 },
    { label: 'First Half', value: 1 }
  ];
  
  startSession: number = 0;
  endSession: number = 0;

  leaveRequestModel: any = {
    leaveTypeId: '',
    reason: ''
  };
  
  isSubmitting = false;
  isLoadingMetadata = false;
  
  notification: ToastConfig = {
    show: false,
    message: '',
    isSuccess: true
  };

  constructor(
    private leaveService: LeaveService, 
    private authService: AuthService,
    private holidayService: HolidayService,
    private attendanceService: AttendanceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLeaveTypes();
    this.loadCalendarMetadataMetrics();
  }

  loadLeaveTypes(): void {
    this.leaveService.GetLeaveTypes().subscribe({
      next: (response: any) => {
        this.allLeaveTypes = Array.isArray(response) ? response : (response?.data || []);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error("Error Fetching Leave Types List:", error);
      }
    });
  }

  get filteredLeaveTypes(): any[] {
    if (this.appMode === 'compoff') {
      return this.allLeaveTypes.filter(t => t.isCompOff === true);
    }
    return this.allLeaveTypes;
  }

  setAppMode(mode: 'leave' | 'compoff'): void {
    this.appMode = mode;
    this.leaveRequestModel.leaveTypeId = '';
    this.startDate = null;
    this.endDate = null;
    this.selectedTypeBalance = null;
    this.generateCalendar();
  }

  onLeaveTypeChange(): void {
    const employeeId = this.authService.getEmployeeId();
    const leaveTypeId = this.leaveRequestModel.leaveTypeId;

    if (!employeeId || !leaveTypeId) {
      this.selectedTypeBalance = null;
      return;
    }

    this.leaveService.GetLeaveBalanceByType(leaveTypeId, employeeId).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.selectedTypeBalance = response.data;
        } else {
          this.selectedTypeBalance = null;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.selectedTypeBalance = null;
        this.cdr.detectChanges();
      }
    });
  }

  loadCalendarMetadataMetrics(): void {
    const employeeId = this.authService.getEmployeeId();
    if (!employeeId) {
      this.generateCalendar();
      return;
    }

    this.isLoadingMetadata = true;
    this.cdr.detectChanges();
    
    forkJoin({
      holidays: this.holidayService.GetHolidays(),
      attendance: this.attendanceService.GetAttendanceByEmployee(employeeId)
    }).subscribe({
      next: (results: { holidays: HolidaysList, attendance: AttendanceListResponse }) => {
        this.holidaysCache = results.holidays?.data || [];
        this.attendanceCache = results.attendance?.data || [];
        this.generateCalendar();
        this.isLoadingMetadata = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Failed to map dynamic calendar metadata profiles:", err);
        this.isLoadingMetadata = false;
        this.generateCalendar();
        this.cdr.detectChanges();
      }
    });
  }

  get currentMonthName(): string {
    return this.currentDate.toLocaleString('default', { month: 'long' });
  }

  get currentYear(): number {
    return this.currentDate.getFullYear();
  }

  get isSingleDaySelected(): boolean {
    if (!this.startDate || !this.endDate) return false;
    return this.clearTime(this.startDate) === this.clearTime(this.endDate);
  }

  setSelectionMode(mode: 'single' | 'range'): void {
    this.selectionMode = mode;
    this.startDate = null;
    this.endDate = null;
    this.startSession = 0;
    this.endSession = 0;
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
    const todayTime = this.clearTime(new Date());
    const dayOfWeek = date.getDay();
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
    
    const matchedHoliday = this.holidaysCache.find(h => this.clearTime(new Date(h.date)) === checkTime);
    const matchedAttendance = this.attendanceCache.find(a => this.clearTime(new Date(a.attendanceDate)) === checkTime);

    return {
      date: date,
      isCurrentMonth: isCurrentMonth,
      isHoliday: !!matchedHoliday,
      holidayName: matchedHoliday ? matchedHoliday.name : undefined,
      attendanceStatus: matchedAttendance ? matchedAttendance.status : undefined,
      isPastDate: checkTime < todayTime,
      isWeekend: isWeekend
    };
  }

  onDateSelect(cell: CalendarCell): void {
    if (cell.isPastDate) {
      this.triggerToastNotification("Selection Rejected: Cannot apply leaves on backdates.", false);
      return;
    }

    if (cell.attendanceStatus) {
      this.triggerToastNotification(`Selection Rejected: Cannot request time off on a date marked as [${cell.attendanceStatus}].`, false);
      return;
    }

    if (this.appMode === 'leave' && cell.isHoliday) {
      this.triggerToastNotification(`Selection Rejected: Cannot select an official corporate holiday [${cell.holidayName}] for regular leave.`, false);
      return;
    }

    if (this.appMode === 'compoff' && !cell.isWeekend && !cell.isHoliday) {
      this.triggerToastNotification("Comp Off Validation Error: You can only select Weekends (Sat/Sun) or Corporate Holidays for Comp Off.", false);
      return;
    }

    const date = cell.date;

    if (this.selectionMode === 'single') {
      this.startDate = date;
      this.endDate = date;
    } else {
      if (!this.startDate || (this.startDate && this.endDate)) {
        this.startDate = date;
        this.endDate = null;
        this.startSession = 0;
        this.endSession = 0;
      } 
      else if (this.startDate && !this.endDate) {
        if (date < this.startDate) {
          this.startDate = date;
          this.endDate = date;
        } else {
          // Range Selection matching attendance component logic: skips weekends (0 and 6)
          let current = new Date(this.startDate);
          let validEnd: Date | null = null;
          
          while (current <= date) {
            const dayOfWeek = current.getDay();
            const checkTime = this.clearTime(current);
            const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
            const isHoliday = this.holidaysCache.some(h => this.clearTime(new Date(h.date)) === checkTime);

            if (!isWeekend && (this.appMode === 'compoff' || !isHoliday)) {
              validEnd = new Date(current);
            }
            current.setDate(current.getDate() + 1);
          }

          this.endDate = date; // Allow picking range boundary; backend submission will cleanly filter out weekends/holidays.
        }
      }
    }
  }

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
    this.cdr.detectChanges();
    setTimeout(() => { 
      if (this.notification.message === msg) {
        this.dismissNotification(); 
      }
    }, 5000);
  }

  dismissNotification(): void {
    this.notification.show = false;
    this.cdr.detectChanges();
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
    this.cdr.detectChanges();

    const formatDateToDateOnlyString = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    let adjustedStartDate = new Date(this.startDate);
    let adjustedEndDate = new Date(this.endDate);

    // Filter out weekends (Saturday/Sunday) and holidays matching attendance component logic
    if (this.appMode === 'leave' && this.selectionMode === 'range' && !this.isSingleDaySelected) {
      const validWorkingDays: Date[] = [];
      let curr = new Date(this.startDate);
      const last = new Date(this.endDate);

      while (curr <= last) {
        const checkTime = this.clearTime(curr);
        const dayOfWeek = curr.getDay();
        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6); // 0 = Sun, 6 = Sat
        const isHoliday = this.holidaysCache.some(h => this.clearTime(new Date(h.date)) === checkTime);

        // Explicitly skip weekends and holidays from being added to payload working days
        if (!isWeekend && !isHoliday) {
          validWorkingDays.push(new Date(curr));
        }

        curr.setDate(curr.getDate() + 1);
      }

      if (validWorkingDays.length === 0) {
        this.isSubmitting = false;
        this.triggerToastNotification("Selected range contains only weekends or holidays. Please select valid working leave days.", false);
        this.cdr.detectChanges();
        return;
      }

      adjustedStartDate = validWorkingDays[0];
      adjustedEndDate = validWorkingDays[validWorkingDays.length - 1];
    } else if (this.appMode === 'leave' && this.isSingleDaySelected) {
      const dayOfWeek = adjustedStartDate.getDay();
      const checkTime = this.clearTime(adjustedStartDate);
      const isHoliday = this.holidaysCache.some(h => this.clearTime(new Date(h.date)) === checkTime);

      if (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday) {
        this.isSubmitting = false;
        this.triggerToastNotification("Cannot apply leave on weekends or holidays as they are already off.", false);
        this.cdr.detectChanges();
        return;
      }
    }

    const finalStartSession = Number(this.startSession);
    const finalEndSession = (this.selectionMode === 'single' || this.isSingleDaySelected) ? finalStartSession : Number(this.endSession);

    const leaveRequestPayload: ApplyLeaveRequestDto = {
      leaveTypeId: this.leaveRequestModel.leaveTypeId,
      startDate: formatDateToDateOnlyString(adjustedStartDate), 
      endDate: formatDateToDateOnlyString(adjustedEndDate),    
      startSession: finalStartSession, 
      endSession: finalEndSession,
      reason: this.leaveRequestModel.reason,
      submittedAt: new Date().toISOString()
    };

    const apiCall$ = this.appMode === 'compoff' 
      ? this.leaveService.ApplyCompOffById(leaveRequestPayload, employeeId)
      : this.leaveService.ApplyLeaveById(leaveRequestPayload, employeeId);

    apiCall$.subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        
        const isSuccessful = response ? (response.success !== false) : true;
        const responseMsg = response?.message || (this.appMode === 'compoff' ? "Comp Off request logged successfully." : "Leave request logged successfully.");

        if (isSuccessful) {
          this.triggerToastNotification(responseMsg, true);
          this.selectedTypeBalance = null;
          this.startDate = null;
          this.endDate = null;
          this.startSession = 0;
          this.endSession = 0;
          form.resetForm({ leaveTypeId: '' });
        } else {
          this.triggerToastNotification(responseMsg, false);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmitting = false;
        const errorMsg = err?.error?.message || err?.message || "Time off request validation execution failed.";
        this.triggerToastNotification(errorMsg, false);
        this.cdr.detectChanges();
      }
    });
  }
}