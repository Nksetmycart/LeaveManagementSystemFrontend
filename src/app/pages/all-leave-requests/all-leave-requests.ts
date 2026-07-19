import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LeaveService, LeaveResponseList } from '../../services/leave-service';

@Component({
  selector: 'app-all-leave-requests',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './all-leave-requests.html',
  styleUrl: './all-leave-requests.css',
})
export class AllLeaveRequests implements OnInit {
  
  leaveRequests: any[] = [];
  apiResponse!: LeaveResponseList;
  isLoading = false;

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.loadAllCompanyRequests();
  }

  loadAllCompanyRequests(): void {
    this.isLoading = true;
    this.leaveService.GetAllLeaveRequests().subscribe({
      next: (response) => {
        this.apiResponse = response;
        const rawData = response.data || [];
        
        this.leaveRequests = rawData.map(record => {
          let normalizedHalfDay = 0;
          
          if (record.isHalfDay) {
            const cleanStr = record.isHalfDay.toString().trim().toLowerCase();
            if (cleanStr === 'firsthalf' || cleanStr === '1') {
              normalizedHalfDay = 1;
            } else if (cleanStr === 'secondhalf' || cleanStr === '2') {
              normalizedHalfDay = 2;
            } else if (cleanStr === 'fullday' || cleanStr === '0') {
              normalizedHalfDay = 0;
            }
          }
          
          return {
            ...record,
            isHalfDay: normalizedHalfDay
          };
        }).sort((a, b) => {
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error("Error fetching absolute corporate leave ledger indices:", error);
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

  calculateLeaveDays(startDate: any, endDate: any, isHalfDayVal: number): number {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    
    if (isHalfDayVal === 1 || isHalfDayVal === 2) {
      return totalDays - 0.5;
    }
    
    return totalDays;
  }

  // UPDATED: Mapped background styles matching your exact request metrics
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
}