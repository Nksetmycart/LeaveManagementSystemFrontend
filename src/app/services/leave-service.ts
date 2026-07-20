import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface LeaveTypeDto {
  name: string;
  description: string;
  isPaid: boolean;
  isActive: boolean;
  reqiresAttachment: boolean;
}

export interface LeaveTypeResponse {
  message: string;
  success: boolean;
  data: string;
}

export interface UpdateLeaveTypeDto {
  name: string;
  description: string;
  isPaid: boolean;
  isActive: boolean;
  reqiresAttachment: boolean;
}

export interface DeleteLeaveTypeResponse {
  message: string;
  success: boolean;
}

// 1. Structural Payload Interface for Apply Leave Dto Setup Parameters
export interface ApplyLeaveRequestDto {
  leaveTypeId: string;
  startDate: string;  // Formats correctly to matching "2026-07-18T15:05:30.450Z" string targets
  endDate: string;
  isHalfDay: number;  // Evaluates to 0 (Full), 1 (First Half), or 2 (Second Half)
  reason: string;
  submittedAt: string;
}

export interface ApplyLeaveResponse {
  message: string;
  success: boolean;
  data?: any;
}

export interface LeaveResponseList {
  message: string;
  success: boolean;
  data: Array<{
    id: string;
    companyId: string;
    employeeName: string;
    employeeRole: string;
    leaveType: string;
    startDate: Date;
    endDate: Date;
    isHalfDay: string;
    reason: string;
    status: string;
    submittedAt: string;
    cancelledAt: string;
    createdAt: Date;
    updatedAt: Date;
  }>
}

export interface LeaveBalancesResponseList {
  message: string;
  success: boolean;
  data: Array<{
    employeeName: string;
    totalBalance: number;
    leaveBalances: Array<{
      id: string;
      leaveType: string;
      year: number;
      earnedLeaves: number;
      usedLeaves: number;
      adjustments: number;
      balance: number;
      lastAccruedOn: Date;
      createdAt: Date;
      updatedAt: Date;
    }>
  }>
}

export interface CancelRequestResponse {
  success: boolean;
  message: string;
}

export interface LeaveApprovalsResponse {
  success: boolean;
  message: string;
  data: Array<{
    id: string;
    leaveType: string;
    employeeName: string;
    employeeRole: string;
    approverName: string;
    approvarRole: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    isHalfDay: string;
    status: string;
    comment: string;
  }>
}

export interface ApprovalDto {
  leaveRequestId: string;
  comment: string;
}

export interface ApprovalResponse {
  success: boolean;
  message: string;
  data: string;
}

export interface AssignLeaveBalanceDto {
  leaveTypeId: string;
  year: number;
  earnedLeaves: number;
  usedLeaves: number;
  adjustments: number;
  lastAccruedOn: Date;
}

export interface AssignLeaveBalanceResponse {
  success: boolean;
  message: string;
  data: string;
}

@Injectable({
  providedIn: 'root',
})
export class LeaveService {

  private baseUrl = 'https://localhost:7241/api/v0';

  constructor(private http: HttpClient) { }

  CreateLeaveType(data: LeaveTypeDto): Observable<LeaveTypeResponse> {
    console.log("Submitting Leave Type DTO:", data);
    return this.http.post<LeaveTypeResponse>(`${this.baseUrl}/LeaveType`, data);
  }

  GetLeaveTypes(): Observable<GetLeaveTypesList> {
    return this.http.get<GetLeaveTypesList>(`${this.baseUrl}/LeaveType`);
  }

  UpdateLeaveTypeById(leaveTypeId: string, data: UpdateLeaveTypeDto): Observable<LeaveTypeResponse> {
    return this.http.put<LeaveTypeResponse>(`${this.baseUrl}/LeaveType/${leaveTypeId}`, data);
  }

  DeleteLeaveTypeById(leaveTypeId: string): Observable<DeleteLeaveTypeResponse> {
    return this.http.delete<DeleteLeaveTypeResponse>(`${this.baseUrl}/LeaveType/${leaveTypeId}`);
  }

  ApplyLeaveById(leaveData: ApplyLeaveRequestDto, employeeId: string): Observable<ApplyLeaveResponse> {
    return this.http.post<ApplyLeaveResponse>(`${this.baseUrl}/LeaveRequest/${employeeId}`, leaveData);
  }

  GetLeaveRequestsByEmployee(employeeId: string): Observable<LeaveResponseList> {
    return this.http.get<LeaveResponseList>(`${this.baseUrl}/LeaveRequest/${employeeId}`)
  }

  CancelLeaveRequest(employeeId: string, leaveRequestId: string): Observable<CancelRequestResponse> {
    return this.http.put<CancelRequestResponse>(`${this.baseUrl}/LeaveRequest/${employeeId}/${leaveRequestId}`, null)
  }

  GetAllLeaveRequests(): Observable<LeaveResponseList> {
    return this.http.get<LeaveResponseList>(`${this.baseUrl}/LeaveRequest`)
  }

  GetAllLeaveBalances(): Observable<LeaveBalancesResponseList> {
    return this.http.get<LeaveBalancesResponseList>(`${this.baseUrl}/LeaveBalance`)
  }

  GetAllLeaveApprovals(): Observable<LeaveApprovalsResponse> {
    return this.http.get<LeaveApprovalsResponse>(`${this.baseUrl}/LeaveApproval`)
  }

  GetLeaveApprovalsByApprovarId(approvarId: string): Observable<LeaveApprovalsResponse> {
    return this.http.get<LeaveApprovalsResponse>(`${this.baseUrl}/LeaveApproval/${approvarId}`)
  }

  ApproveLeave(approvarId: string, data: ApprovalDto): Observable<ApprovalResponse> {
    return this.http.post<ApprovalResponse>(`${this.baseUrl}/LeaveApproval/${approvarId}/approve`, data)
  }

  RejectLeave(approvarId: string, data: ApprovalDto): Observable<ApprovalResponse> {
    return this.http.post<ApprovalResponse>(`${this.baseUrl}/LeaveApproval/${approvarId}/reject`, data)
  }

  AssignLeaveBalance(employeeId: string, data: AssignLeaveBalanceDto): Observable<AssignLeaveBalanceResponse> {
    return this.http.post<AssignLeaveBalanceResponse>(`${this.baseUrl}/LeaveBalance/${employeeId}`, data)
  }
}

export class GetLeaveTypesList {
  message!: string;
  success!: boolean;
  data!: Array<{
    id: string;
    name: string;
    description: string;
    isPaid: boolean; // Aligned parameter flags definitions explicitly to boolean
    reqiresAttachment: boolean;
    isActive: boolean;
  }>;
}