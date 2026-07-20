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

  // Custom alert placeholder configuration model state
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

  loadRequestList(): void {
    this.leaveService.GetAllLeaveRequests().subscribe({
      next: (response: LeaveResponseList) => {
        if (response.success && response.data) {
          this.pendingRequests = response.data.filter(req => req.status?.toLowerCase() === 'pending');
          
          console.log("LeaveRequests: ", response.data);
          if (this.pendingRequests.length > 0 && !this.selectedRequest) {
            this.selectRequestItem(this.pendingRequests[0]);
          } else if (this.pendingRequests.length === 0) {
            this.selectedRequest = null;
          }
        }
        this.isLoading = false;
      }, 
      error: (error) => {
        this.triggerNotification(error?.error?.message || "Failed to sync pending leave allocations.", false);
        this.isLoading = false;
      }
    });
  }

  loadLeaveApprovals(): void {
    this.leaveService.GetLeaveApprovalsByApprovarId(this.approvarId).subscribe({
      next: (response: LeaveApprovalsResponse) => {
        if (response.success && response.data) {
          this.decidedApprovals = response.data;
        }
      }, 
      error: (error) => {
        console.error("Failed to sync structural decided leaves audit logs:", error);
      }
    });
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

  calculateLeaveDays(startDate: any, endDate: any, isHalfDayStr: string): number {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    return (isHalfDayStr === '1' || isHalfDayStr === '2') ? totalDays - 0.5 : totalDays;
  }

  // --- CUSTOM POPUP INTERCEPT CONTROLS ---
  triggerNotification(msg: string, isSuccess: boolean): void {
    this.notification = {
      show: true,
      message: msg,
      isSuccess: isSuccess
    };

    // Auto dismisses notification framework after 5 seconds automatically
    setTimeout(() => {
      this.dismissNotification();
    }, 5000);
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