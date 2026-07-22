import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LeaveService, LeaveResponseList } from '../../services/leave-service';

@Component({
  selector: 'app-all-leave-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './all-leave-requests.html',
  styleUrl: './all-leave-requests.css',
})
export class AllLeaveRequests implements OnInit {
  
  leaveRequests: any[] = [];
  apiResponse!: LeaveResponseList;
  isLoading = false;

  // Pagination Active Parameters Trackers
  page = 1;
  pageSize = 10;
  totalItems = 0;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.loadAllCompanyRequests();
  }

  loadAllCompanyRequests(): void {
    this.isLoading = true;
    
    this.leaveService.GetAllLeaveRequests(this.page, this.pageSize).subscribe({
      next: (response: any) => {
        this.apiResponse = response;
        const rawData = response.data || [];
        
        if (response.totalCount !== undefined) {
          this.totalItems = response.totalCount;
        } else if (response.totalItems !== undefined) {
          this.totalItems = response.totalItems;
        } else {
          this.totalItems = rawData.length < this.pageSize && this.page === 1 
            ? rawData.length 
            : (this.page * this.pageSize) + 1;
        }

        this.leaveRequests = rawData.map((record: any) => {
          return {
            ...record,
            startSession: record.startSession ? record.startSession.trim() : 'FullDay',
            endSession: record.endSession ? record.endSession.trim() : 'FullDay'
          };
        }).sort((a: any, b: any) => {
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

  onPageChange(newPage: number): void {
    if (newPage < 1 || (this.totalItems > 0 && newPage > this.totalPages)) return;
    this.page = newPage;
    this.loadAllCompanyRequests();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.page = 1; 
    this.loadAllCompanyRequests();
  }

  get totalPages(): number {
    if (this.totalItems <= this.leaveRequests.length && this.page === 1) return 1;
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get startItemIndex(): number {
    if (this.leaveRequests.length === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get endItemIndex(): number {
    const computedEnd = this.page * this.pageSize;
    if (this.totalItems <= this.leaveRequests.length && this.page === 1) return this.leaveRequests.length;
    return computedEnd > this.totalItems ? this.totalItems : computedEnd;
  }

  getInitials(name: string): string {
    if (!name) return 'EE';
    const parts = name.trim().split(/\s+/);
    return parts.length > 1 
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() 
      : `${parts[0][0]}${parts[0][1] || ''}`.toUpperCase();
  }

  /**
   * Calculates total leave days accurately based on Date range + startSession & endSession deductions
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

    // Deduct 0.5 if it's a single day request taking a half session
    if (totalDays === 1) {
      if (sSession === 'firsthalf' || sSession === 'secondhalf' || eSession === 'firsthalf' || eSession === 'secondhalf') {
        return 0.5;
      }
    } else {
      // Multi-day deduction logic
      if (sSession === 'secondhalf') {
        totalDays -= 0.5;
      }
      if (eSession === 'firsthalf') {
        totalDays -= 0.5;
      }
    }
    
    return totalDays;
  }

  getSessionBadgeClass(session: string): string {
    if (!session) return 'bg-light text-secondary border';
    const clean = session.trim().toLowerCase();
    if (clean.includes('first')) return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
    if (clean.includes('second')) return 'bg-info-subtle text-info-emphasis border border-info-subtle';
    return 'bg-light text-secondary border';
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
}