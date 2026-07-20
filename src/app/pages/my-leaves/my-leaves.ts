import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { LeaveService, LeaveResponseList } from '../../services/leave-service';

@Component({
  selector: 'app-my-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-leaves.html',
  styleUrl: './my-leaves.css',
})
export class MyLeaves implements OnInit {
  
  leaveHistory: any[] = [];
  apiResponse!: LeaveResponseList;
  isLoading = false;
  isCancelling = false;

  // Pagination Trackers
  page = 1;
  pageSize = 5; 
  totalItems = 0;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  // Row Accordion Dropdown pointer
  expandedRowIndex: number | null = null;

  // Custom Confirmation Modal Overlay States
  showCancelModal = false;
  leaveToCancel: any | null = null;

  constructor(
    private leaveService: LeaveService, 
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEmployeeLeaveHistory();
  }

  loadEmployeeLeaveHistory(): void {
    const employeeId = this.authService.getEmployeeId();
    if (!employeeId) {
      console.error("Pipeline blocked: Active identity context missing.");
      return;
    }

    this.isLoading = true;
    
    this.leaveService.GetLeaveRequestsByEmployee(employeeId, this.page, this.pageSize).subscribe({
      next: (response: any) => {
        this.apiResponse = response;
        this.leaveHistory = response.data || [];
        
        // SAFE FALLBACK DETECTOR: Explicitly processes nested meta variables or handles local array constraints
        if (response.totalCount !== undefined) {
          this.totalItems = response.totalCount;
        } else if (response.totalItems !== undefined) {
          this.totalItems = response.totalItems;
        } else if (response.meta?.totalCount !== undefined) {
          this.totalItems = response.meta.totalCount;
        } else {
          // Fallback logic keeps page navigation interactive when tracking parameters are empty from backend
          this.totalItems = this.leaveHistory.length < this.pageSize && this.page === 1 
            ? this.leaveHistory.length 
            : (this.page * this.pageSize) + 1; 
        }
        
        this.isLoading = false;
        this.expandedRowIndex = null;
      },
      error: (error) => {
        this.isLoading = false;
        console.error("Error retrieving customized leave logs:", error);
      }
    });
  }

  onPageChange(newPage: number): void {
    if (newPage < 1 || (this.totalItems > 0 && newPage > this.totalPages)) return;
    this.page = newPage;
    this.loadEmployeeLeaveHistory();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.page = 1; 
    this.loadEmployeeLeaveHistory();
  }

  get totalPages(): number {
    // Prevent locking downstream parameters out if metadata limits evaluate to empty values
    if (this.totalItems <= this.leaveHistory.length && this.page === 1) return 1;
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get startItemIndex(): number {
    if (this.leaveHistory.length === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get endItemIndex(): number {
    const computedEnd = this.page * this.pageSize;
    if (this.totalItems <= this.leaveHistory.length && this.page === 1) return this.leaveHistory.length;
    return computedEnd > this.totalItems ? this.totalItems : computedEnd;
  }

  toggleRowExpansion(index: number): void {
    this.expandedRowIndex = this.expandedRowIndex === index ? null : index;
  }

  canCancel(status: string): boolean {
    if (!status) return false;
    return status.trim().toLowerCase() === 'pending';
  }

  openCancelConfirmation(leave: any): void {
    this.leaveToCancel = leave;
    this.showCancelModal = true;
  }

  closeCancelConfirmation(): void {
    this.showCancelModal = false;
    this.leaveToCancel = null;
    this.isCancelling = false;
  }

  confirmCancel(): void {
    if (!this.leaveToCancel) return;

    const employeeId = this.authService.getEmployeeId();
    if (!employeeId) {
      console.error("Cancellation blocked: Active employee context identity missing.");
      return;
    }

    this.isCancelling = true;

    this.leaveService.CancelLeaveRequest(employeeId, this.leaveToCancel.id).subscribe({
      next: (res) => {
        if (res && res.success === false) {
          this.handleCancellationError(res.message || "The application configuration pipeline rejected adjustments.");
          return;
        }
        this.closeCancelConfirmation();
        this.loadEmployeeLeaveHistory(); 
      },
      error: (err) => {
        this.handleCancellationError(err?.error?.message || err?.message || "An error occurred while withdrawing the request entry.");
      }
    });
  }

  private handleCancellationError(errorMessage: string): void {
    this.isCancelling = false;
    console.error("Failed executing cancellation workflow drop operation:", errorMessage);
    alert(errorMessage);
  }

  calculateLeaveDays(startDate: any, endDate: any, isHalfDayStr: string): number {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    
    if (isHalfDayStr === '1' || isHalfDayStr === '2' || isHalfDayStr?.toLowerCase().includes('half')) {
      return totalDays - 0.5;
    }
    
    return totalDays;
  }

  getStatusClass(status: string): string {
    if (!status) return 'bg-secondary-subtle text-secondary';
    
    switch (status.trim().toLowerCase()) {
      case 'approved': return 'bg-success-subtle text-success';
      case 'pending': return 'bg-warning-subtle text-warning-emphasis';
      case 'rejected': return 'bg-danger-subtle text-danger';
      default: return 'bg-secondary-subtle text-secondary';
    }
  }
}