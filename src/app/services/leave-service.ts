import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export enum RenewalType {
  None = 'None',
  Monthly = 'Monthly',
  Yearly = 'Yearly'
}
export interface LeaveTypeDto {
  name: string;
  description: string;
  isPaid: boolean;
  isActive: boolean;
  isCompOff: boolean;
  renewal: RenewalType;
  renewalAmount: string;
  reqiresAttachment: boolean;
}

export interface GetLeaveTypesList {
  message: string;
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    description: string;
    isPaid: boolean;
    isCompOff: boolean;
    renewal: RenewalType;
    renewalAmount: number;
    reqiresAttachment: boolean;
    isActive: boolean;
  }>;
}

export interface UpdateLeaveTypeDto {
  name: string;
  description: string;
  isPaid: boolean;
  isActive: boolean;
  isCompOff: boolean;
  renewal: RenewalType;
  renewalAmount: number;
  reqiresAttachment: boolean;
}

export interface ApplyLeaveRequestDto {
  leaveTypeId: string;
  startDate: string;  
  endDate: string;
  startSession: number;  // Evaluates to 0 (Full), 1 (First Half), or 2 (Second Half)
  endSession: number;  // Evaluates to 0 (Full), 1 (First Half), or 2 (Second Half)
  reason: string;
  submittedAt: string;
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
    startSession: string;
    endSession: string;
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
export interface LeaveBalanceResponse {
  message: string;
  success: boolean;
  data: {
    id: string;
    year: number;
    earnedLeaves: number;
    usedLeaves: number;
    adjustments: number;
    balance: number;
    lastAccruedOn: Date;
  }
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
    startSession: string;
    endSession: string;
    status: string;
    comment: string;
  }>
}

export interface ApprovalDto {
  leaveRequestId: string;
  comment: string;
}

export interface AssignLeaveBalanceDto {
  leaveTypeId: string;
  year: number;
  earnedLeaves: number;
  usedLeaves: number;
  adjustments: number;
  lastAccruedOn: Date;
}

export interface Response {
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

  CreateLeaveType(data: LeaveTypeDto): Observable<Response> {
    console.log("Submitting Leave Type DTO:", data);
    return this.http.post<Response>(`${this.baseUrl}/LeaveType`, data);
  }

  GetLeaveTypes(): Observable<GetLeaveTypesList> {
    return this.http.get<GetLeaveTypesList>(`${this.baseUrl}/LeaveType`);
  }

  UpdateLeaveTypeById(leaveTypeId: string, data: UpdateLeaveTypeDto): Observable<Response> {
    return this.http.put<Response>(`${this.baseUrl}/LeaveType/${leaveTypeId}`, data);
  }

  DeleteLeaveTypeById(leaveTypeId: string): Observable<Response> {
    return this.http.delete<Response>(`${this.baseUrl}/LeaveType/${leaveTypeId}`);
  }

  ApplyLeaveById(leaveData: ApplyLeaveRequestDto, employeeId: string): Observable<Response> {
    return this.http.post<Response>(`${this.baseUrl}/LeaveRequest/${employeeId}`, leaveData);
  }

  ApplyCompOffById(compOffData: ApplyLeaveRequestDto, employeeId: string): Observable<Response> {
    return this.http.post<Response>(`${this.baseUrl}/CompOff/${employeeId}`, compOffData);
  }

  GetLeaveRequestsByEmployee(employeeId: string, page: number, pageSize: number): Observable<LeaveResponseList> {
    return this.http.get<LeaveResponseList>(`${this.baseUrl}/LeaveRequest/${employeeId}?page=${page}&pageSize=${pageSize}`)
  }

  CancelLeaveRequest(employeeId: string, leaveRequestId: string): Observable<Response> {
    return this.http.put<Response>(`${this.baseUrl}/LeaveRequest/${employeeId}/${leaveRequestId}`, null)
  }

  GetAllLeaveRequests(page: number, pageSize: number): Observable<LeaveResponseList> {
    return this.http.get<LeaveResponseList>(`${this.baseUrl}/LeaveRequest?page=${page}&pageSize=${pageSize}`)
  }

  GetAllCompOffRequests(page: number, pageSize: number): Observable<LeaveResponseList> {
    return this.http.get<LeaveResponseList>(`${this.baseUrl}/CompOff?page=${page}&pageSize=${pageSize}`)
  }

  GetAllPendingLeaveRequests(page: number, pageSize: number): Observable<LeaveResponseList> {
    return this.http.get<LeaveResponseList>(`${this.baseUrl}/LeaveRequest?status=Pending&page=${page}&pageSize=${pageSize}`)
  }

  GetAllPendingCompOffRequests(page: number, pageSize: number): Observable<LeaveResponseList> {
    return this.http.get<LeaveResponseList>(`${this.baseUrl}/CompOff?status=Pending&page=${page}&pageSize=${pageSize}`)
  }

  GetAllLeaveBalances(page: number, pageSize: number): Observable<LeaveBalancesResponseList> {
    return this.http.get<LeaveBalancesResponseList>(`${this.baseUrl}/LeaveBalance?page=${page}&pageSize=${pageSize}`)
  }

  GetLeaveBalanceByType(leaveTypeId: string, employeeId: string): Observable<LeaveBalanceResponse> {
    return this.http.get<LeaveBalanceResponse>(`${this.baseUrl}/LeaveBalance/leave-type-balance/${employeeId}?leaveTypeId=${leaveTypeId}`)
  }

  GetAllLeaveApprovals(page: number, pageSize: number): Observable<LeaveApprovalsResponse> {
    return this.http.get<LeaveApprovalsResponse>(`${this.baseUrl}/LeaveApproval?page=${page}&pageSize=${pageSize}`)
  }

  GetLeaveApprovalsByApprovarId(approvarId: string, page: number, pageSize: number): Observable<LeaveApprovalsResponse> {
    return this.http.get<LeaveApprovalsResponse>(`${this.baseUrl}/LeaveApproval/${approvarId}?page=${page}&pageSize=${pageSize}`)
  }

  ApproveLeave(approvarId: string, data: ApprovalDto): Observable<Response> {
    return this.http.post<Response>(`${this.baseUrl}/LeaveApproval/${approvarId}/approve`, data)
  }

  ApproveCompOff(approvarId: string, data: ApprovalDto): Observable<Response> {
    return this.http.post<Response>(`${this.baseUrl}/CompOff/${approvarId}/approve`, data)
  }

  RejectLeave(approvarId: string, data: ApprovalDto): Observable<Response> {
    return this.http.post<Response>(`${this.baseUrl}/LeaveApproval/${approvarId}/reject`, data)
  }

  AssignLeaveBalance(employeeId: string, data: AssignLeaveBalanceDto): Observable<Response> {
    return this.http.post<Response>(`${this.baseUrl}/LeaveBalance/${employeeId}`, data)
  }

  RenewLeaveBalances(): Observable<Response> {
    return this.http.post<Response>(`${this.baseUrl}/LeaveBalance/renew-monthly-balance`, null)
  }
}

