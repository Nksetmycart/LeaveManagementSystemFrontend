import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface EmployeeDashboardDto {
  success: boolean;
  message: string;
  data: {
    totalLeaveBalance: number;
    totalLeaveRequests: number;
    Holidays: Array<{
      id: string;
      name: string;
      type: string;
      date: string;
    }>
    LeaveBalances: Array<{
      name: string;
      usedLeaves: number;
      balance: string;
    }>
  }
}

export interface AdminDashboardDto {
  success: boolean;
  message: string;
  data: {
    totalEmmployees: number;
    approvedLeaveRequests: number;
    rejectedLeaveRequests: number;
    holidays: Array<{
      id: string;
      companyId: string;
      name: string;
      type: string;
      date: string;
      createdAt: string;
      updatedAt: string;
    }>;
   LeaveBalances: Array<{
      name: string;
      usedLeaves: number;
      balance: string;
    }>
  }
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private baseUrl = 'https://localhost:7241/api/v0/Dashboard';

  constructor(private http: HttpClient) {}

  GetEmployeeDashboardData(employeeId: string): Observable<EmployeeDashboardDto> {
    return this.http.get<EmployeeDashboardDto>(`${this.baseUrl}/employee/${employeeId}`);
  }

  // FIXED: Removed literal string bug so it resolves the private baseUrl variable property correctly
  GetAdminDashboardData(employeeId: string): Observable<AdminDashboardDto> {
    return this.http.get<AdminDashboardDto>(`${this.baseUrl}/${employeeId}`);
  }
}