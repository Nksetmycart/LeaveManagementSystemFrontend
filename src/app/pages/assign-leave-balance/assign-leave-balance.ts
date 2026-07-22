import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { LeaveService, AssignLeaveBalanceDto, GetLeaveTypesList } from '../../services/leave-service';
import { EmployeeService, EmployeeListResponse, EmployeeResponseDto } from '../../services/employee-service';
import { forkJoin } from 'rxjs';

interface ToastConfig {
  show: boolean;
  message: string;
  isSuccess: boolean;
}

@Component({
  selector: 'app-assign-leave-balance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-leave-balance.html',
  styleUrl: './assign-leave-balance.css',
})
export class AssignLeaveBalance implements OnInit {
  
  employeesList: EmployeeResponseDto[] = [];
  leaveTypesList: any[] = [];
  
  dropdownPage = 1;
  dropdownPageSize = 5;
  dropdownSearchQuery = '';

  isLoadingMetadata = false;
  isSubmitting = false;

  selectedEmployeeId = '';
  balanceModel: AssignLeaveBalanceDto = {
    leaveTypeId: '',
    year: new Date().getFullYear(),
    earnedLeaves: 0,
    usedLeaves: 0,
    adjustments: 0,
    lastAccruedOn: new Date()
  };

  notification: ToastConfig = {
    show: false,
    message: '',
    isSuccess: true
  };

  constructor(
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardPrerequisitesLedger();
  }

  loadDashboardPrerequisitesLedger(): void {
    this.isLoadingMetadata = true;
    
    forkJoin({
      employees: this.employeeService.GetEmployees(1, 1000),
      leaveTypes: this.leaveService.GetLeaveTypes()
    }).subscribe({
      next: (results: { employees: EmployeeListResponse, leaveTypes: GetLeaveTypesList }) => {
        this.employeesList = results.employees?.data || [];
        this.leaveTypesList = results.leaveTypes?.data || [];
        this.isLoadingMetadata = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingMetadata = false;
        this.triggerNotification("System metrics pipeline failure: could not fetch structural data dependencies.", false);
        console.error("Initialization metrics sync block failed downstream:", err);
      }
    });
  }

  get filteredEmployees(): EmployeeResponseDto[] {
    if (!this.dropdownSearchQuery.trim()) {
      return this.employeesList;
    }
    const query = this.dropdownSearchQuery.toLowerCase().trim();
    return this.employeesList.filter(emp => 
      emp.name?.toLowerCase().includes(query) || 
      emp.department?.toLowerCase().includes(query) ||
      emp.role?.toLowerCase().includes(query)
    );
  }

  get paginatedEmployees(): EmployeeResponseDto[] {
    const startIndex = (this.dropdownPage - 1) * this.dropdownPageSize;
    return this.filteredEmployees.slice(startIndex, startIndex + this.dropdownPageSize);
  }

  get totalDropdownPages(): number {
    return Math.ceil(this.filteredEmployees.length / this.dropdownPageSize) || 1;
  }

  changeDropdownPage(event: Event, direction: number): void {
    event.preventDefault();
    event.stopPropagation();
    const targetPage = this.dropdownPage + direction;
    if (targetPage >= 1 && targetPage <= this.totalDropdownPages) {
      this.dropdownPage = targetPage;
    }
  }

  onDropdownSearchChange(): void {
    this.dropdownPage = 1;
  }

  submitBalanceAllocation(form: NgForm): void {
    if (form.invalid || !this.selectedEmployeeId) {
      this.triggerNotification("Validation Guard: Form contains invalid field allocations constraints.", false);
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges(); // Force UI to show loading spinner immediately

    const payload: AssignLeaveBalanceDto = {
      ...this.balanceModel,
      lastAccruedOn: new Date(this.balanceModel.lastAccruedOn)
    };

    this.leaveService.AssignLeaveBalance(this.selectedEmployeeId, payload).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;

        const isSuccessful = response ? (response.success !== false) : true;
        const responseMsg = response?.message || "Leave balance thresholds successfully assigned.";

        if (isSuccessful) {
          this.triggerNotification(responseMsg, true);
          this.resetFormState(form);
        } else {
          this.triggerNotification(responseMsg, false);
        }
        this.cdr.detectChanges(); // Force UI to dismiss spinner and render toast banner
      },
      error: (err) => {
        this.isSubmitting = false;
        const errorMsg = err?.error?.message || err?.message || "A network transaction pipeline error occurred.";
        this.triggerNotification(errorMsg, false);
        this.cdr.detectChanges(); // Force UI to dismiss spinner and render error toast
      }
    });
  }

  triggerNotification(msg: string, isSuccess: boolean): void {
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

  private resetFormState(form: NgForm): void {
    this.selectedEmployeeId = '';
    this.dropdownSearchQuery = '';
    this.dropdownPage = 1;
    
    this.balanceModel = {
      leaveTypeId: '',
      year: new Date().getFullYear(),
      earnedLeaves: 0,
      usedLeaves: 0,
      adjustments: 0,
      lastAccruedOn: new Date()
    };
    
    form.resetForm({
      year: new Date().getFullYear(),
      earnedLeaves: 0,
      usedLeaves: 0,
      adjustments: 0,
      lastAccruedOn: new Date().toISOString().split('T')[0]
    });
  }
}