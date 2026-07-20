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

  // Custom Top Center Notification Floating Toast state context configuration
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

  /**
   * Run parallel metadata fetch scripts utilizing rxjs pipelines forks execution maps
   */
  loadDashboardPrerequisitesLedger(): void {
    this.isLoadingMetadata = true;
    
    forkJoin({
      employees: this.employeeService.GetEmployees(),
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

  submitBalanceAllocation(form: NgForm): void {
    if (form.invalid || !this.selectedEmployeeId) {
      this.triggerNotification("Validation Guard: Form contains invalid field allocations constraints.", false);
      return;
    }

    this.isSubmitting = true;

    // Deep clones payload details to configure clean transactional timestamps
    const payload: AssignLeaveBalanceDto = {
      ...this.balanceModel,
      lastAccruedOn: new Date(this.balanceModel.lastAccruedOn)
    };

    this.leaveService.AssignLeaveBalance(this.selectedEmployeeId, payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.triggerNotification(response.message || "Leave balance thresholds successfully assigned to worker record context.", true);
          this.resetFormState(form);
        } else {
          this.triggerNotification(response.message || "Allocation request rejected by target data servers rules.", false);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.triggerNotification(err?.error?.message || "A network transaction pipeline error occurred while dispatching allocation parameters.", false);
      }
    });
  }

  triggerNotification(msg: string, isSuccess: boolean): void {
    this.notification = {
      show: true,
      message: msg,
      isSuccess: isSuccess
    };
    
    setTimeout(() => {
      this.dismissNotification();
    }, 5000);
  }

  dismissNotification(): void {
    this.notification.show = false;
  }

  private resetFormState(form: NgForm): void {
    this.selectedEmployeeId = '';
    form.resetForm({
      year: new Date().getFullYear(),
      earnedLeaves: 0,
      usedLeaves: 0,
      adjustments: 0,
      lastAccruedOn: new Date().toISOString().split('T')[0]
    });
  }
}