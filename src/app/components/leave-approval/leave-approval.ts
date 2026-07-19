import { Component, OnInit } from '@angular/core';
import { LeaveResponseList, LeaveService } from '../../services/leave-service';

@Component({
  selector: 'app-leave-approval',
  imports: [],
  templateUrl: './leave-approval.html',
  styleUrl: './leave-approval.css',
})
export class LeaveApproval implements OnInit {
  requestList!: LeaveResponseList;
  isLoading = false;
  isCancelling = false;

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.loadRequestList();
  }

  loadRequestList(): void {
    this.leaveService.GetAllLeaveRequests().subscribe({
      next: (response) => {
        if (response.success) {
        }
      }, 
      error: (error) => {
        
      }
    })
  }
}
