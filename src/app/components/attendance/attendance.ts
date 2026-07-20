import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { AttendanceService, MarkAttendance } from '../../services/attendance-service';
import { HolidayService, HolidaysList } from '../../services/holiday-service'; // Added Holiday Service Import

interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
  isFuture: boolean;
  isHoliday?: boolean;      // Added tracking property flag
  holidayName?: string;     // Added tracking property value name
}

type SelectionMode = 'single' | 'range';
type AttendanceType = 'Working' | 'Leave' | 'FirstHalf' | 'SecondHalf';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class Attendance implements OnInit {
  @Input() employeeIdOverride!: string; 

  currentDate: Date = new Date(); 
  calendarCells: CalendarCell[] = [];
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  attendanceList: any[] = [];
  holidaysCache: any[] = []; // Added database holidays collection array cache container

  selectionMode: SelectionMode = 'single';
  selectedDates: Set<string> = new Set<string>();
  backendAttendanceDates: Set<string> = new Set<string>();
  
  rangeStart: Date | null = null;
  rangeEnd: Date | null = null;
  employeeId!: string;

  activeSelectedStatus: AttendanceType = 'Working';
  apiErrorMessage: string | null = null; 

  attendanceRecords: { [key: string]: AttendanceType } = {};
  stats = { working: 0, leave: 0, halfDays: 0, totalHours: 0.0 };

  constructor(
    private attendanceService: AttendanceService,
    private holidayService: HolidayService // Injected HolidayService securely
  ) {}

  ngOnInit(): void {
    if (this.employeeIdOverride) {
      this.employeeId = this.employeeIdOverride;
      // Pipeline call sequences are loaded sequentially to preserve original execution order
      this.loadHolidayDataIndex(); 
    } else {
      console.error("Attendance Component Error: 'employeeIdOverride' was not provided by the parent component.");
    }
  }

  // --- NEW HOOK ADDITION: Fetches public holidays list database index entries ---
  loadHolidayDataIndex(): void {
    this.holidayService.GetHolidays().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.holidaysCache = response.data;
        }
        // Always executes core methods downstream regardless of result parameters to prevent breaking baseline view states
        this.generateCalendar();
        this.loadAttendanceList();
      },
      error: (error) => {
        console.error("Error pulling holiday parameters:", error);
        this.generateCalendar();
        this.loadAttendanceList();
      }
    });
  }

  // --- GETTERS RESOLVING TEMPLATE ERRORS ---
  get currentMonthName(): string {
    return this.currentDate.toLocaleString('default', { month: 'long' });
  }

  get currentYear(): number {
    return this.currentDate.getFullYear();
  }

  dismissApiError(): void {
    this.apiErrorMessage = null;
  }

  loadAttendanceList(): void {
    this.attendanceService.GetAttendanceByEmployee(this.employeeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.apiErrorMessage = null;
          this.attendanceList = response.data;
          
          this.attendanceRecords = {};
          this.selectedDates.clear();
          this.backendAttendanceDates.clear();

          this.attendanceList.forEach((record: any) => {
            if (record.attendanceDate && record.status !== undefined && record.status !== null) {
              const dateKey = record.attendanceDate.split('T')[0];
              
              let statusMapped: AttendanceType = 'Working';
              const incomingStatus = String(record.status).trim().toLowerCase().replace(/\s+/g, '');

              if (incomingStatus === 'leave' || incomingStatus === '1') {
                statusMapped = 'Leave';
              } else if (incomingStatus === 'firsthalf' || incomingStatus === '2') {
                statusMapped = 'FirstHalf';
              } else if (incomingStatus === 'secondhalf' || incomingStatus === '3') {
                statusMapped = 'SecondHalf';
              } else {
                statusMapped = 'Working';
              }

              this.attendanceRecords[dateKey] = statusMapped;
              this.backendAttendanceDates.add(dateKey);
            }
          });

          this.recalculateDashboardStats();
        } else {
          this.apiErrorMessage = response.message || 'No attendance records found for this employee.';
        }
      },
      error: (error) => {
        console.error("Error pulling database profiles:", error);
        this.apiErrorMessage = 'A network exception occurred while fetching attendance profiles.';
      }
    });
  }

  setSelectionMode(mode: SelectionMode): void {
    this.selectionMode = mode;
    this.clearSelection();
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const todayTimestamp = this.clearTime(new Date());

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startOffset = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const cells: CalendarCell[] = [];

    const createCell = (dateObj: Date, isCurrent: boolean): CalendarCell => {
      const keyStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      
      // Scans database records for matching date parameters context tracking metrics
      const matchedHoliday = this.holidaysCache.find(h => h.date && h.date.split('T')[0] === keyStr);

      return {
        date: dateObj,
        isCurrentMonth: isCurrent,
        isFuture: this.clearTime(dateObj) > todayTimestamp,
        isHoliday: !!matchedHoliday,
        holidayName: matchedHoliday ? matchedHoliday.name : undefined
      };
    };

    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push(createCell(new Date(year, month, -i), false));
    }
    for (let i = 1; i <= totalDays; i++) {
      cells.push(createCell(new Date(year, month, i), true));
    }
    const totalGridSize = cells.length > 35 ? 42 : 35;
    const remainingSlots = totalGridSize - cells.length;
    for (let i = 1; i <= remainingSlots; i++) {
      cells.push(createCell(new Date(year, month + 1, i), false));
    }

    this.calendarCells = cells;
  }

  handleCellSelection(date: Date): void {
    const dateKey = this.getDateKey(date);
    this.apiErrorMessage = null; 

    // BLOCKS MANIPULATION INTERCEPTOR: Rejects changes over locked official corporate holidays records bounds
    const matchedCell = this.calendarCells.find(c => this.getDateKey(c.date) === dateKey);
    if (matchedCell?.isHoliday) {
      this.apiErrorMessage = `Selection Refused: Cannot adjust attendance parameters over official holiday "${matchedCell.holidayName}".`;
      return;
    }

    if (this.backendAttendanceDates.has(dateKey)) {
      return; 
    }

    const todayTimestamp = this.clearTime(new Date());
    const targetTimestamp = this.clearTime(date);

    if (targetTimestamp > todayTimestamp) {
      return; 
    }

    if (this.selectionMode === 'single') {
      if (this.selectedDates.has(dateKey)) {
        this.selectedDates.delete(dateKey);
        delete this.attendanceRecords[dateKey];
      } else {
        this.clearTemporarySelections();
        this.selectedDates.add(dateKey);
        this.attendanceRecords[dateKey] = this.activeSelectedStatus;
      }
    } 
    else if (this.selectionMode === 'range') {
      if (!this.rangeStart || (this.rangeStart && this.rangeEnd)) {
        this.clearTemporarySelections();
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

  updateSelectedDaysStatus(status: AttendanceType): void {
    this.activeSelectedStatus = status;
    this.selectedDates.forEach(key => {
      // Prevents updating historical database indicators or active public holiday fields indices
      const cellCheck = this.calendarCells.find(c => this.getDateKey(c.date) === key);
      if (!this.backendAttendanceDates.has(key) && !cellCheck?.isHoliday) {
        this.attendanceRecords[key] = status;
      }
    });
    this.recalculateDashboardStats();
  }

  private clearTemporarySelections(): void {
    Object.keys(this.attendanceRecords).forEach(key => {
      if (!this.backendAttendanceDates.has(key)) {
        delete this.attendanceRecords[key];
        this.selectedDates.delete(key);
      }
    });
  }

  private applyRangeAttendance(): void {
    if (!this.rangeStart || !this.rangeEnd) return;
    const todayTimestamp = this.clearTime(new Date());

    let current = new Date(this.rangeStart);
    while (current <= this.rangeEnd) {
      const currentTimestamp = this.clearTime(current);
      const key = this.getDateKey(current);
      
      const cellCheck = this.calendarCells.find(c => this.getDateKey(c.date) === key);

      if (
        currentTimestamp <= todayTimestamp && 
        current.getDay() !== 0 && 
        current.getDay() !== 6 && 
        !this.backendAttendanceDates.has(key) &&
        !cellCheck?.isHoliday // Bypass range selection assignments across mapped public holidays boundaries
      ) {
        this.attendanceRecords[key] = this.activeSelectedStatus;
        this.selectedDates.add(key);
      }
      current.setDate(current.getDate() + 1);
    }
  }

  recalculateDashboardStats(): void {
    let w = 0; let l = 0; let h = 0;
    
    Object.keys(this.attendanceRecords).forEach(key => {
      const type = this.attendanceRecords[key];
      if (type === 'Working') w++;
      else if (type === 'Leave') l++;
      else if (type === 'FirstHalf' || type === 'SecondHalf') h++;
    });

    this.stats.working = w;
    this.stats.leave = l;
    this.stats.halfDays = h;
    this.stats.totalHours = (w * 9.0) + (h * 4.5);
  }

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
    this.rangeStart = null;
    this.rangeEnd = null;
    this.activeSelectedStatus = 'Working';
    this.apiErrorMessage = null;
    this.clearTemporarySelections();
    this.recalculateDashboardStats();
  }

  getDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private clearTime(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }

  getReadableStatusName(type: AttendanceType): string {
    if (type === 'FirstHalf') return 'First Half';
    if (type === 'SecondHalf') return 'Second Half';
    return type;
  }

  getRecordBadgeClass(type: AttendanceType): string {
    switch (type) {
      case 'Working': return 'status-pill bg-present'; 
      case 'Leave': return 'status-pill bg-wfh';       
      case 'FirstHalf':
      case 'SecondHalf': 
        return 'status-pill bg-half';     
      default: return 'status-pill bg-light text-muted';
    }
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.loadHolidayDataIndex();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.loadHolidayDataIndex();
  }

  hasSelections(): boolean {
    let directAdditions = false;
    this.selectedDates.forEach(dateStr => {
      if (!this.backendAttendanceDates.has(dateStr)) {
        directAdditions = true;
      }
    });

    return this.selectionMode === 'single' ? directAdditions : !!this.rangeStart;
  }

  isBackendDate(date: Date): boolean {
    return this.backendAttendanceDates.has(this.getDateKey(date));
  }

  submitAttendance(): void {
    const updatesList: { dateKey: string, status: AttendanceType }[] = [];
    
    Object.keys(this.attendanceRecords).forEach(key => {
      if (!this.backendAttendanceDates.has(key)) {
        updatesList.push({
          dateKey: key, 
          status: this.attendanceRecords[key]
        });
      }
    });

    if (updatesList.length === 0) {
      this.apiErrorMessage = 'No new selections found to record.';
      return;
    }

    if (this.selectionMode === 'single' || updatesList.length === 1) {
      const item = updatesList[0];
      
      const payload: MarkAttendance = {
        attendanceDate: item.dateKey, 
        status: item.status
      };

      this.attendanceService.MarkAttendance(payload, this.employeeId).subscribe({
        next: (response) => {
          if (response.success) {
            this.clearSelection();
            this.loadAttendanceList();
          } else {
            this.apiErrorMessage = response.message || 'Failed to submit attendance log entry.';
          }
        },
        error: (err) => {
          console.error(err);
          this.apiErrorMessage = 'An error occurred while transmitting your attendance records.';
        }
      });
    } 
    else if (this.selectionMode === 'range') {
      const payloadBulk: MarkAttendance[] = updatesList.map(item => ({
        attendanceDate: item.dateKey, 
        status: item.status
      }));

      this.attendanceService.MarkBulkAttendance(payloadBulk, this.employeeId).subscribe({
        next: (response) => {
          if (response.success) {
            this.clearSelection();
            this.loadAttendanceList();
          } else {
            this.apiErrorMessage = response.message || 'Failed to submit bulk allocation array records.';
          }
        },
        error: (err) => {
          console.error(err);
          this.apiErrorMessage = 'An error occurred while transmitting your bulk attendance records.';
        }
      });
    }
  }
}