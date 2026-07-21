import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, Role } from '../../services/auth-service';
import { LeaveService, LeaveBalancesResponseList } from '../../services/leave-service';
import { RouterLink } from '@angular/router';

interface LeaveMetrics {
  remaining: number;
  total: number;
}

interface DynamicEmployeeRecord {
  employeeName: string;
  initials: string;
  role: string;
  balances: { [leaveType: string]: LeaveMetrics };
}

@Component({
  selector: 'app-leave-balance',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './leave-balance.html',
  styleUrl: './leave-balance.css',
})
export class LeaveBalance implements OnInit {
  Role = Role;
  
  balancesList: DynamicEmployeeRecord[] = [];
  dynamicColumns: string[] = []; 
  apiResponse!: LeaveBalancesResponseList;
  isLoading = false;

  // Active Pagination Trackers
  page = 1;
  pageSize = 10;
  totalItems = 0;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  constructor(
    public authService: AuthService,
    private leaveService: LeaveService
  ) {}

  ngOnInit(): void {
    this.loadAllLeaveBalances();
  }

  loadAllLeaveBalances(backupPage: number = this.page, backupSize: number = this.pageSize): void {
    this.isLoading = true;
    
    this.leaveService.GetAllLeaveBalances(this.page, this.pageSize).subscribe({
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

        this.processDynamicData(rawData);
        this.isLoading = false;
        console.log("Dynamically mapped leave balances:", this.balancesList, "Columns:", this.dynamicColumns);
      },
      error: (error) => {
        this.isLoading = false;
        console.error("Error retrieving dynamic leave ledger metrics:", error);

        // Fall back to previous valid page/size if 404 is encountered
        if (error?.status === 404) {
          console.warn(`Fetch aborted (404 Not Found). Rolling back pagination indexes to: Page ${backupPage}, Size ${backupSize}`);
          this.page = backupPage;
          this.pageSize = backupSize;
        }
      }
    });
  }

  // Navigation Event Triggers
  onPageChange(newPage: number): void {
    if (newPage < 1 || (this.totalItems > 0 && newPage > this.totalPages)) return;
    const prevPage = this.page;
    this.page = newPage;
    this.loadAllLeaveBalances(prevPage, this.pageSize);
  }

  onPageSizeChange(size: number): void {
    const prevSize = this.pageSize;
    const prevPage = this.page;
    this.pageSize = size;
    this.page = 1;
    this.loadAllLeaveBalances(prevPage, prevSize);
  }

  // Getters for Pagination Layout Math
  get totalPages(): number {
    if (this.totalItems <= this.balancesList.length && this.page === 1) return 1;
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get startItemIndex(): number {
    if (this.balancesList.length === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get endItemIndex(): number {
    const computedEnd = this.page * this.pageSize;
    if (this.totalItems <= this.balancesList.length && this.page === 1) return this.balancesList.length;
    return computedEnd > this.totalItems ? this.totalItems : computedEnd;
  }

  /**
   * Dynamically tracks unique column variants across records
   */
  private processDynamicData(apiData: any[]): void {
    if (!apiData || !Array.isArray(apiData)) {
      this.balancesList = [];
      this.dynamicColumns = [];
      return;
    }

    const uniqueColumnSet = new Set<string>();

    this.balancesList = apiData.map((empRecord) => {
      const nameParts = (empRecord.employeeName || '').trim().split(/\s+/);
      const initials = nameParts.length > 1 
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : `${nameParts[0]?.[0] || 'E'}${nameParts[0]?.[1] || 'M'}`.toUpperCase();

      const record: DynamicEmployeeRecord = {
        employeeName: empRecord.employeeName || 'Unknown Employee',
        initials: initials,
        role: empRecord.role || 'Personnel Team Member',
        balances: {}
      };

      if (Array.isArray(empRecord.leaveBalances)) {
        empRecord.leaveBalances.forEach((bal: any) => {
          if (bal.leaveType) {
            const columnName = bal.leaveType.trim();
            uniqueColumnSet.add(columnName);

            record.balances[columnName] = {
              remaining: bal.balance ?? 0,
              total: (bal.earnedLeaves ?? 0) + (bal.adjustments ?? 0)
            };
          }
        });
      }

      return record;
    });

    this.dynamicColumns = Array.from(uniqueColumnSet).sort((a, b) => a.localeCompare(b));
  }

  openBulkAllocation(): void {
    console.log('Opening dynamic structural allocation wizard panel container layers...');
  }
}