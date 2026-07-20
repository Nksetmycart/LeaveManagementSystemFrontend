import { Component, OnInit } from '@angular/core';
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
  
  // Operational Directory Data Caches
  employeesList: EmployeeResponseDto[] = [];
  leaveTypesList: any[] = [];
  
  // Dropdown Internal Pagination States
  dropdownPage = 1;
  dropdownPageSize = 5;
  dropdownSearchQuery = '';

  // State Tracking Elements Pointers
  isLoadingMetadata = false;
  isSubmitting = false;

  // Form Controls Model Binding Instance
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
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadDashboardPrerequisitesLedger();
  }

  loadDashboardPrerequisitesLedger(): void {
    this.isLoadingMetadata = true;
    
    forkJoin({
      // Fetching a comprehensive base index array allows efficient client-side filtering blocks
      employees: this.employeeService.GetEmployees(1, 1000),
      leaveTypes: this.leaveService.GetLeaveTypes()
    }).subscribe({
      next: (results: { employees: EmployeeListResponse, leaveTypes: GetLeaveTypesList }) => {
        this.employeesList = results.employees?.data || [];
        this.leaveTypesList = results.leaveTypes?.data || [];
        this.isLoadingMetadata = false;
      },
      error: (err) => {
        this.isLoadingMetadata = false;
        this.triggerNotification("System metrics pipeline failure: could not fetch structural data dependencies.", false);
        console.error("Initialization metrics sync block failed downstream:", err);
      }
    });
  }

  // --- COMPONENT SELECTION INTERNAL DROPDOWN FILTER ENGINE ---
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
    event.stopPropagation(); // Prevents choice closing side-effects
    const targetPage = this.dropdownPage + direction;
    if (targetPage >= 1 && targetPage <= this.totalDropdownPages) {
      this.dropdownPage = targetPage;
    }
  }

  onDropdownSearchChange(): void {
    this.dropdownPage = 1; // Re-center pointer upon filter modification queries
  }

  submitBalanceAllocation(form: NgForm): void {
    if (form.invalid || !this.selectedEmployeeId) {
      this.triggerNotification("Validation Guard: Form contains invalid field allocations constraints.", false);
      return;
    }

    this.isSubmitting = true;

    const payload: AssignLeaveBalanceDto = {
      ...this.balanceModel,
      lastAccruedOn: new Date(this.balanceModel.lastAccruedOn)
    };

    this.leaveService.AssignLeaveBalance(this.selectedEmployeeId, payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.triggerNotification(response.message || "Leave balance thresholds successfully assigned.", true);
          this.resetFormState(form);
        } else {
          this.triggerNotification(response.message || "Allocation request rejected by data servers.", false);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.triggerNotification(err?.error?.message || "A network transaction pipeline error occurred.", false);
      }
    });
  }

  triggerNotification(msg: string, isSuccess: boolean): void {
    this.notification = { show: true, message: msg, isSuccess: isSuccess };
    setTimeout(() => { this.dismissNotification(); }, 5000);
  }

  dismissNotification(): void {
    this.notification.show = false;
  }

  private resetFormState(form: NgForm): void {
    this.selectedEmployeeId = '';
    this.dropdownSearchQuery = '';
    this.dropdownPage = 1;
    form.resetForm({
      year: new Date().getFullYear(),
      earnedLeaves: 0,
      usedLeaves: 0,
      adjustments: 0,
      lastAccruedOn: new Date().toISOString().split('T')[0]
    });
  }
}