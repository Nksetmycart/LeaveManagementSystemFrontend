import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { DashboardService, ApprovalStatusCount, AdminDashboardDto, EmployeeDashboardDto } from '../../services/dashboard-service';

// Interface typed precisely against ApprovalStatusCount.data element array item structure
interface ApproverMetric {
  name: string;
  role: string;
  approvedCount: number;
  rejectedCount: number;
}

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent implements OnInit {
  employeeId!: string;
  role!: string;
  user!: any;

  dashboardData: any = null;
  upcomingHoliday: any = null;
  isLoadingData = false;
  isLoadingApprovers = false;

  // Active Live Dataset Metrics
  approverMetrics: ApproverMetric[] = [];

  // Pagination Active Parameter Trackers
  page = 1;
  pageSize = 5;
  totalApproverItems = 0;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.employeeId = this.authService.getEmployeeId();
    this.role = this.authService.getRole() || '';
    this.user = this.authService.getUser();

    const normalizedRole = this.role.trim().toLowerCase();

    if (normalizedRole === 'employee') {
      this.loadEmployeeHomeMetrics();
    } else if (normalizedRole) {
      this.loadAdminHomeMetrics();
    }
  }

  loadEmployeeHomeMetrics(): void {
    if (!this.employeeId) return;

    this.isLoadingData = true;
    this.dashboardService.GetEmployeeDashboardData(this.employeeId).subscribe({
      next: (response: EmployeeDashboardDto) => {
        this.dashboardData = response?.data;
        this.extractUpcomingHoliday(response?.data?.Holidays);
        this.isLoadingData = false;
      },
      error: (error) => {
        console.error("Error retrieving custom live overview data indices:", error);
        this.isLoadingData = false;
      }
    });
  }

  loadAdminHomeMetrics(): void {
    if (!this.employeeId) return;

    this.isLoadingData = true;
    this.dashboardService.GetAdminDashboardData(this.employeeId).subscribe({
      next: (response: AdminDashboardDto) => {
        this.dashboardData = response?.data;
        this.extractUpcomingHoliday(response?.data?.holidays);
        this.isLoadingData = false;

        // Check if user has SuperAdmin role (handling various casing and space variations)
        const normalizedRole = (this.role || '').toLowerCase().replace(/\s+/g, '');
        if (normalizedRole.includes('superadmin')) {
          this.getApprovalStatus();
        }
      },
      error: (error) => {
        console.error("Error running admin metrics initialization operations:", error);
        this.isLoadingData = false;
      }
    });
  }

  // ALIGNED WITH ApprovalStatusCount INTERFACE
  getApprovalStatus(backupPage: number = this.page, backupSize: number = this.pageSize): void {
    this.isLoadingApprovers = true;

    this.dashboardService.GetApprovalStatus(this.page, this.pageSize).subscribe({
      next: (response: ApprovalStatusCount) => {
        if (response.success && Array.isArray(response.data)) {
          const rawData = response.data;

          // Safe fallback total estimation if API envelope omits aggregate metadata
          const rawResponse = response as any;
          this.totalApproverItems = rawResponse.totalCount ?? rawResponse.totalItems ?? (
            rawData.length < this.pageSize && this.page === 1 
              ? rawData.length 
              : (this.page * this.pageSize) + 1
          );

          // Precise field mapping matching ApprovalStatusCount interface properties
          this.approverMetrics = rawData.map((item) => ({
            name: item.approvarName || 'Authorized Approver',
            role: item.role || 'Manager',
            approvedCount: item.approved ?? 0,
            rejectedCount: item.rejected ?? 0
          }));
        } else {
          this.approverMetrics = [];
        }

        this.isLoadingApprovers = false;
      },
      error: (error) => {
        this.isLoadingApprovers = false;
        console.error("Error fetching live approver status records:", error);

        // Intercept 404 & revert pagination states cleanly
        if (error?.status === 404) {
          console.warn(`Fetch aborted (404 Not Found). Rolling back page indexes to Page ${backupPage}`);
          this.page = backupPage;
          this.pageSize = backupSize;
        }
      }
    });
  }

  // --- APPROVER PAGINATION CONTROLLERS ---
  onApproverPageChange(newPage: number): void {
    if (newPage < 1 || (this.totalApproverItems > 0 && newPage > this.totalApproverPages)) return;
    const prevPage = this.page;
    this.page = newPage;
    this.getApprovalStatus(prevPage, this.pageSize);
  }

  onApproverPageSizeChange(size: number): void {
    const prevSize = this.pageSize;
    const prevPage = this.page;
    this.pageSize = size;
    this.page = 1;
    this.getApprovalStatus(prevPage, prevSize);
  }

  get totalApproverPages(): number {
    if (this.totalApproverItems <= this.approverMetrics.length && this.page === 1) return 1;
    return Math.ceil(this.totalApproverItems / this.pageSize) || 1;
  }

  get startApproverIndex(): number {
    if (this.approverMetrics.length === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get endApproverIndex(): number {
    const computedEnd = this.page * this.pageSize;
    if (this.totalApproverItems <= this.approverMetrics.length && this.page === 1) return this.approverMetrics.length;
    return computedEnd > this.totalApproverItems ? this.totalApproverItems : computedEnd;
  }

  private extractUpcomingHoliday(holidays: any[]): void {
    if (holidays && holidays.length > 0) {
      const currentTimestamp = new Date().getTime();
      
      const sorted = [...holidays].sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.getTime ? b.getTime() : b.date).getTime();
      });

      const nextHoliday = sorted.find(h => new Date(h.date).getTime() >= currentTimestamp);
      this.upcomingHoliday = nextHoliday ? nextHoliday : sorted[0];
    } else {
      this.upcomingHoliday = null;
    }
  }

  getLeavePercentage(balance: any, used: any): number {
    const numBalance = parseFloat(balance) || 0;
    const numUsed = parseFloat(used) || 0;
    const totalAllocated = numBalance + numUsed;
    if (totalAllocated === 0) return 0;
    return (numBalance / totalAllocated) * 100;
  }

  navigateToApplyLeave(): void {
    console.log('Routing link engine redirect executed for: Apply Leave');
  }

  navigateToMarkAttendance(): void {
    console.log('Routing link engine redirect executed for: Attendance Logging Grid');
  }
}