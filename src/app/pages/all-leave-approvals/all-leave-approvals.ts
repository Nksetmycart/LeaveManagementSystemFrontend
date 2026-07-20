import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { LeaveService, LeaveApprovalsResponse } from '../../services/leave-service';

@Component({
  selector: 'app-all-leave-approvals',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './all-leave-approvals.html',
  styleUrl: './all-leave-approvals.css',
})
export class AllLeaveApprovals implements OnInit {

  approvalLogs: any[] = [];
  apiResponse!: LeaveApprovalsResponse;
  isLoading = false;

  // Pagination Active Parameters Trackers
  page = 1;
  pageSize = 10;
  totalItems = 0;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.loadAllCompanyApprovals();
  }

  loadAllCompanyApprovals(): void {
    this.isLoading = true;
    
    this.leaveService.GetAllLeaveApprovals(this.page, this.pageSize).subscribe({
      next: (response: any) => {
        this.apiResponse = response;
        const rawData = response.data || [];
        
        // Dynamic summary mapping fallback fields
        if (response.totalCount !== undefined) {
          this.totalItems = response.totalCount;
        } else if (response.totalItems !== undefined) {
          this.totalItems = response.totalItems;
        } else {
          this.totalItems = rawData.length < this.pageSize && this.page === 1 
            ? rawData.length 
            : (this.page * this.pageSize) + 1;
        }

        // FIXED: Explicitly added type definition 'record: any' inside the map block parameter line to satisfy compiler rules
        this.approvalLogs = rawData.map((record: any) => {
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

  onPageChange(newPage: number): void {
    if (newPage < 1 || (this.totalItems > 0 && newPage > this.totalPages)) return;
    this.page = newPage;
    this.loadAllCompanyApprovals();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.page = 1; 
    this.loadAllCompanyApprovals();
  }

  get totalPages(): number {
    if (this.totalItems <= this.approvalLogs.length && this.page === 1) return 1;
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get startItemIndex(): number {
    if (this.approvalLogs.length === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get endItemIndex(): number {
    const computedEnd = this.page * this.pageSize;
    if (this.totalItems <= this.approvalLogs.length && this.page === 1) return this.approvalLogs.length;
    return computedEnd > this.totalItems ? this.totalItems : computedEnd;
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
    const totalCalendarDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    
    const cleanStr = isHalfDayStr?.toString().trim().toLowerCase();
    if (cleanStr === 'firsthalf' || cleanStr === 'secondhalf' || cleanStr === '1' || cleanStr === '2') {
      return totalCalendarDays * 0.5;
    }
    
    return totalCalendarDays;
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