import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { DashboardService } from '../../services/dashboard-service';

// Interface defining the tracking structure for HR/Manager leave metrics counters
interface ApproverMetric {
  name: string;
  role: string;
  approvedCount: number;
  rejectedCount: number;
}

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [CommonModule, RouterLink],
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

  // Static Mock Dataset covering core metrics for HR / Managers determination balances
  approverMetrics: ApproverMetric[] = [
    { name: 'Aarav Sharma', role: 'HR Manager', approvedCount: 14, rejectedCount: 2 },
    { name: 'Ishita Patel', role: 'Project Lead', approvedCount: 9, rejectedCount: 4 },
    { name: 'Rohan Das', role: 'Department Head', approvedCount: 22, rejectedCount: 1 },
    { name: 'Meera Reddy', role: 'Operations Manager', approvedCount: 11, rejectedCount: 3 }
  ];

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.employeeId = this.authService.getEmployeeId();
    this.role = this.authService.getRole();
    this.user = this.authService.getUser();

    if (this.role && this.role.trim().toLowerCase() === 'employee') {
      this.loadEmployeeHomeMetrics();
    } else if (this.role) {
      this.loadAdminHomeMetrics();
    }
  }

  loadEmployeeHomeMetrics(): void {
    if (!this.employeeId) return;

    this.isLoadingData = true;
    this.dashboardService.GetEmployeeDashboardData(this.employeeId).subscribe({
      next: (response: any) => {
        const rawPayload = response?.data ? response.data : response;
        this.dashboardData = rawPayload;
        
        this.extractUpcomingHoliday(rawPayload?.Holidays || rawPayload?.holidays);
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
      next: (response: any) => {
        const rawPayload = response?.data ? response.data : response;
        this.dashboardData = rawPayload;
        
        this.extractUpcomingHoliday(rawPayload?.holidays || rawPayload?.Holidays);
        this.isLoadingData = false;
      },
      error: (error) => {
        console.error("Error running admin metrics initialization operations:", error);
        this.isLoadingData = false;
      }
    });
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