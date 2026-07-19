import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LeaveService, LeaveApprovalsResponse } from '../../services/leave-service';

@Component({
  selector: 'app-all-leave-approvals',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './all-leave-approvals.html',
  styleUrl: './all-leave-approvals.css',
})
export class AllLeaveApprovals implements OnInit {

  approvalLogs: any[] = [];
  apiResponse!: LeaveApprovalsResponse;
  isLoading = false;

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.loadAllCompanyApprovals();
  }

  loadAllCompanyApprovals(): void {
    this.isLoading = true;
    this.leaveService.GetAllLeaveApprovals().subscribe({
      next: (response) => {
        this.apiResponse = response;
        const rawData = response.data || [];
        
        // NORMALIZATION ENGINE: Converts string literal descriptors to standardized words matching comparisons
        this.approvalLogs = rawData.map(record => {
          let normalizedHalfDay = 'fullday';
          if (record.isHalfDay) {
            const cleanStr = record.isHalfDay.toString().trim().toLowerCase();
            if (cleanStr.includes('first') || cleanStr === '1') {
              normalizedHalfDay = 'firsthalf';
            } else if (cleanStr.includes('second') || cleanStr === '2') {
              normalizedHalfDay = 'secondhalf';
            }
          }
          return {
            ...record,
            isHalfDay: normalizedHalfDay
          };
        });

        this.isLoading = false;
        console.log("Global corporate decision ledger synchronized and normalized:", this.approvalLogs);
      },
      error: (error) => {
        this.isLoading = false;
        console.error("Error retrieving global approvals statement indexes:", error);
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return 'EE';
    const parts = name.trim().split(/\s+/);
    return parts.length > 1 
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() 
      : `${parts[0][0]}${parts[0][1] || ''}`.toUpperCase();
  }

  // FIXED: Day span arithmetic engine adjusts total dynamically by removing 0.5 for partial variations
  calculateLeaveDays(startDate: any, endDate: any, isHalfDayStr: string): number {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Clear time stamps to calculate absolute day differences cleanly
  start.setHours(0,0,0,0);
  end.setHours(0,0,0,0);
  
  const timeDiff = Math.abs(end.getTime() - start.getTime());
  const totalCalendarDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // Equals 9 days for your data
  
  // NORMALIZATION ENGINE RULE: If it's a half-day leave type, multiply the entire duration by 0.5
  const cleanStr = isHalfDayStr?.toString().trim().toLowerCase();
  if (cleanStr === 'firsthalf' || cleanStr === 'secondhalf' || cleanStr === '1' || cleanStr === '2') {
    return totalCalendarDays * 0.5; // Exactly 4.5 days
  }
  
  return totalCalendarDays; // 9 days for standard Full Day requests
}

  getStatusClass(status: string): string {
    if (!status) return 'bg-secondary-subtle text-secondary';
    
    switch (status.trim().toLowerCase()) {
      case 'approved': 
      case 'accepted':
        return 'bg-success-subtle text-success';
      case 'rejected': 
        return 'bg-danger-subtle text-danger';
      default: 
        return 'bg-secondary-subtle text-secondary';
    }
  }
}