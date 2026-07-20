import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  // A dynamic key-value dictionary mapping the leave type name to its specific metrics block
  balances: { [leaveType: string]: LeaveMetrics };
}

@Component({
  selector: 'app-leave-balance',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './leave-balance.html',
  styleUrl: './leave-balance.css',
})
export class LeaveBalance implements OnInit {
  Role = Role;
  
  balancesList: DynamicEmployeeRecord[] = [];
  dynamicColumns: string[] = []; // Stores the master collection of unique leave type column names
  apiResponse!: LeaveBalancesResponseList;
  isLoading = false;

  constructor(
    public authService: AuthService,
    private leaveService: LeaveService
  ) {}

  ngOnInit(): void {
    this.loadAllLeaveBalances();
  }

  loadAllLeaveBalances(): void {
    this.isLoading = true;
    this.leaveService.GetAllLeaveBalances().subscribe({
      next: (response) => {
        this.apiResponse = response;
        this.processDynamicData(response.data);
        this.isLoading = false;
        console.log("Dynamically mapped leave balances:", this.balancesList, "Columns:", this.dynamicColumns);
      },
      error: (error) => {
        this.isLoading = false;
        console.error("Error retrieving dynamic leave ledger metrics:", error);
      }
    });
  }

  /**
   * Dynamically tracks all unique column variants across all records while parsing data parameters cleanly
   */
  private processDynamicData(apiData: any[]): void {
    if (!apiData || !Array.isArray(apiData)) {
      this.balancesList = [];
      this.dynamicColumns = [];
      return;
    }

    const uniqueColumnSet = new Set<string>();

    // 1. First Pass: Map individual data sets and gather all possible leave types
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
            // Keep original naming casing for UI display context rules
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

    // 2. Second Pass: Convert the unique set to a sorted array to display consistent dynamic columns
    this.dynamicColumns = Array.from(uniqueColumnSet).sort((a, b) => a.localeCompare(b));
  }

  openBulkAllocation(): void {
    console.log('Opening dynamic structural allocation wizard panel container layers...');
  }
}