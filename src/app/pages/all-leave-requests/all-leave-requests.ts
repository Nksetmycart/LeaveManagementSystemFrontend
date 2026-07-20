import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Ensure forms module is added for ngModel mappings
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
        
        // Dynamic fallback assessment handles scalar integers or count keys cleanly
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