import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService, LeaveResponseList, LeaveApprovalsResponse, ApprovalDto } from '../../services/leave-service';
import { AuthService } from '../../services/auth-service';
import { RouterLink } from '@angular/router';

interface ToastConfig {
  show: boolean;
  message: string;
  isSuccess: boolean;
}

@Component({
  selector: 'app-leave-approval',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './leave-approval.html',
  styleUrl: './leave-approval.css',
})
export class LeaveApproval implements OnInit {
  approvarId!: string;
  
  pendingRequests: any[] = [];
  decidedApprovals: any[] = [];
  
  selectedRequest: any | null = null;
  decisionComment = '';
  
  isLoading = false;
  isProcessingAction = false;

  // Pagination Trackers — Left Side (Pending Requests)
  page = 1;
  pageSize = 5;
  totalItemsPending = 0;

  // Pagination Trackers — Left Side Base (Recently Decided)
  page1 = 1;
  pageSize1 = 5;
  totalItemsDecided = 0;

  pageSizeOptions: number[] = [5, 10, 20, 50];

  notification: ToastConfig = {
    show: false,
    message: '',
    isSuccess: true
  };

  constructor(private leaveService: LeaveService, private authService: AuthService) {}

  ngOnInit(): void {
    this.approvarId = this.authService.getEmployeeId();
    this.loadAllApprovalDashboardMetrics();
  }

  loadAllApprovalDashboardMetrics(): void {
    this.isLoading = true;
    this.loadRequestList();
    this.loadLeaveApprovals();
  }

  // --- SAFE API WRAPPER FOR PENDING REQUESTS ---
  loadRequestList(backupPage: number = this.page, backupSize: number = this.pageSize): void {
    this.leaveService.GetAllPendingLeaveRequests(this.page, this.pageSize).subscribe({
      next: (response: LeaveResponseList) => {
        if (response.success && response.data) {
          this.pendingRequests = response.data.filter(req => req.status?.toLowerCase() === 'pending').map((record: any) => ({
            ...record,
            startSession: record.startSession ? record.startSession.trim() : 'FullDay',
            endSession: record.endSession ? record.endSession.trim() : 'FullDay'
          }));
          
          const rawResponse = response as any;
          if (rawResponse.totalCount !== undefined) {
            this.totalItemsPending = rawResponse.totalCount;
          } else {
            this.totalItemsPending = this.pendingRequests.length < this.pageSize && this.page === 1
              ? this.pendingRequests.length 
              : (this.page * this.pageSize) + 1;
          }

          if (this.pendingRequests.length > 0 && !this.selectedRequest) {
            this.selectRequestItem(this.pendingRequests[0]);
          } else if (this.pendingRequests.length === 0) {
            this.selectedRequest = null;
          }
        }
        this.isLoading = false;
      }, 
      error: (error) => {
        this.isLoading = false;
        
        // INTERCEPT 404 NOT FOUND: Roll back the active properties instantly
        if (error?.status === 404) {
          console.warn(`Fetch aborted (404 Not Found). Reverting pending layout trackers to: Page ${backupPage}, Size ${backupSize}`);
          this.page = backupPage;
          this.pageSize = backupSize;
          this.triggerNotification("The requested page data does not exist. Navigation rolled back.", false);
        } else {
          this.triggerNotification(error?.error?.message || "Failed to sync pending leave allocations.", false);
        }
      }
    });
  }

  // --- SAFE API WRAPPER FOR DECIDED REQUESTS ---
  loadLeaveApprovals(backupPage1: number = this.page1, backupSize1: number = this.pageSize1): void {
    this.leaveService.GetLeaveApprovalsByApprovarId(this.approvarId, this.page1, this.pageSize1).subscribe({
      next: (response: LeaveApprovalsResponse) => {
        if (response.success && response.data) {
          this.decidedApprovals = response.data.map((record: any) => ({
            ...record,
            startSession: record.startSession ? record.startSession.trim() : 'FullDay',
            endSession: record.endSession ? record.endSession.trim() : 'FullDay'
          }));
          
          const rawResponse = response as any;
          if (rawResponse.totalCount !== undefined) {
            this.totalItemsDecided = rawResponse.totalCount;
          } else {
            this.totalItemsDecided = this.decidedApprovals.length < this.pageSize1 && this.page1 === 1
              ? this.decidedApprovals.length
              : (this.page1 * this.pageSize1) + 1;
          }
        }
      }, 
      error: (error) => {
        console.error("Failed to sync structural decided leaves audit logs:", error);
        
        // INTERCEPT 404 NOT FOUND: Revert history index trackers immediately
        if (error?.status === 404) {
          console.warn(`Fetch aborted (404 Not Found). Reverting decided layout trackers to: Page ${backupPage1}, Size ${backupSize1}`);
          this.page1 = backupPage1;
          this.pageSize1 = backupSize1;
          this.triggerNotification("No records available on the requested page timeline view.", false);
        }
      }
    });
  }

  // --- PAGINATION EVENT TRIGGERS WITH SAFE RESTORATION SNAPSHOTS ---
  onPendingPageChange(newPage: number): void {
    if (newPage < 1 || (this.totalItemsPending > 0 && newPage > this.totalPagesPending)) return;
    
    const prevPage = this.page;
    this.page = newPage;
    this.loadRequestList(prevPage, this.pageSize);
  }

  onPendingPageSizeChange(size: number): void {
    const prevSize = this.pageSize;
    const prevPage = this.page;
    
    this.pageSize = size;
    this.page = 1;
    this.loadRequestList(prevPage, prevSize);
  }

  onDecidedPageChange(newPage: number): void {
    if (newPage < 1 || (this.totalItemsDecided > 0 && newPage > this.totalPagesDecided)) return;
    
    const prevPage1 = this.page1;
    this.page1 = newPage;
    this.loadLeaveApprovals(prevPage1, this.pageSize1);
  }

  onDecidedPageSizeChange(size: number): void {
    const prevSize1 = this.pageSize1;
    const prevPage1 = this.page1;
    
    this.pageSize1 = size;
    this.page1 = 1;
    this.loadLeaveApprovals(prevPage1, prevSize1);
  }

  // --- PAGINATION ARITHMETIC GETTERS ---
  get totalPagesPending(): number {
    if (this.totalItemsPending <= this.pendingRequests.length && this.page === 1) return 1;
    return Math.ceil(this.totalItemsPending / this.pageSize) || 1;
  }

  get totalPagesDecided(): number {
    if (this.totalItemsDecided <= this.decidedApprovals.length && this.page1 === 1) return 1;
    return Math.ceil(this.totalItemsDecided / this.pageSize1) || 1;
  }

  get startPendingIndex(): number {
    if (this.pendingRequests.length === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get endPendingIndex(): number {
    const computedEnd = this.page * this.pageSize;
    if (this.totalItemsPending <= this.pendingRequests.length && this.page === 1) return this.pendingRequests.length;
    return computedEnd > this.totalItemsPending ? this.totalItemsPending : computedEnd;
  }

  get startDecidedIndex(): number {
    if (this.decidedApprovals.length === 0) return 0;
    return (this.page1 - 1) * this.pageSize1 + 1;
  }

  get endDecidedIndex(): number {
    const computedEnd = this.page1 * this.pageSize1;
    if (this.totalItemsDecided <= this.decidedApprovals.length && this.page1 === 1) return this.decidedApprovals.length;
    return computedEnd > this.totalItemsDecided ? this.totalItemsDecided : computedEnd;
  }

  selectRequestItem(request: any): void {
    this.selectedRequest = request;
    this.decisionComment = ''; 
  }

  getInitials(name: string): string {
    if (!name) return 'EE';
    const parts = name.trim().split(/\s+/);
    return parts.length > 1 
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() 
      : `${parts[0][0]}${parts[0][1] || ''}`.toUpperCase();
  }

  /**
   * Calculates total leave days based on date span and session types
   */
  calculateLeaveDays(startDate: any, endDate: any, startSession: string, endSession: string): number {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    let totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    
    const sSession = (startSession || '').trim().toLowerCase();
    const eSession = (endSession || '').trim().toLowerCase();

    if (totalDays === 1) {
      if (sSession === 'firsthalf' || sSession === 'secondhalf' || eSession === 'firsthalf' || eSession === 'secondhalf') {
        return 0.5;
      }
    } else {
      if (sSession === 'secondhalf') {
        totalDays -= 0.5;
      }
      if (eSession === 'firsthalf') {
        totalDays -= 0.5;
      }
    }
    
    return totalDays;
  }

  getStatusClass(status: string): string {
    if (!status) return 'bg-secondary-subtle text-secondary';
    
    switch (status.trim().toLowerCase()) {
      case 'approved': 
      case 'accepted': 
        return 'bg-success-subtle text-success';
      case 'pending': 
        return 'bg-warning-subtle text-warning-emphasis';
      case 'rejected': 
        return 'bg-danger-subtle text-danger';
      case 'cancelled':
      case 'canceled':
        return 'bg-purple-subtle text-purple-emphasis border-purple';
      default: 
        return 'bg-secondary-subtle text-secondary';
    }
  }

  triggerNotification(msg: string, isSuccess: boolean): void {
    this.notification = { show: true, message: msg, isSuccess: isSuccess };
    setTimeout(() => { this.dismissNotification(); }, 5000);
  }

  dismissNotification(): void {
    this.notification.show = false;
  }

  onApprove(): void {
    if (!this.selectedRequest || this.isProcessingAction) return;
    this.isProcessingAction = true;
    const dto: ApprovalDto = {
      leaveRequestId: this.selectedRequest.id,
      comment: this.decisionComment
    };

    this.leaveService.ApproveLeave(this.approvarId, dto).subscribe({
      next: (response) => {
        this.isProcessingAction = false;
        if (response.success) {
          this.triggerNotification("Leave request successfully approved and processed.", true);
          this.refreshDashboardState();
        } else {
          this.triggerNotification(response.message || "Approval execution request aborted.", false);
        }
      },
      error: (err) => {
        this.isProcessingAction = false;
        this.triggerNotification(err?.error?.message || "A pipeline error derailed the approval request.", false);
      }
    });
  }

  onReject(): void {
    if (!this.selectedRequest || this.isProcessingAction) return;
    this.isProcessingAction = true;
    const dto: ApprovalDto = {
      leaveRequestId: this.selectedRequest.id,
      comment: this.decisionComment
    };

    this.leaveService.RejectLeave(this.approvarId, dto).subscribe({
      next: (response) => {
        this.isProcessingAction = false;
        if (response.success) {
          this.triggerNotification("Leave request has been rejected cleanly.", true);
          this.refreshDashboardState();
        } else {
          this.triggerNotification(response.message || "Rejection execution request aborted by data server.", false);
        }
      },
      error: (err) => {
        this.isProcessingAction = false;
        this.triggerNotification(err?.error?.message || "A network pipeline error derailed the request operation.", false);
      }
    });
  }

  private refreshDashboardState(): void {
    this.selectedRequest = null;
    this.loadRequestList();
    this.loadLeaveApprovals();
  }
}