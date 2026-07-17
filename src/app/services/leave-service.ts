import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Renamed to avoid name clashing with the Component class
export interface LeaveTypeDto {
  name: string;
  description: string;
  isPaid: boolean;
  isActive: boolean;
  reqiresAttachment: boolean; // Aligned spelling to match what you use in the template/backend
}

export interface LeaveTypeResponse {
  message: string;
  success: boolean;
  data: string;
}

export interface UpdateLeaveTypeDto {
  name: string,
  description: string,
  isPaid: boolean,
  isActive: boolean,
  reqiresAttachment: boolean
}

export interface DeleteLeaveTypeResponse {
  message: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  constructor(private http: HttpClient) { }

  CreateLeaveType(data: LeaveTypeDto): Observable<LeaveTypeResponse> {
    console.log("Submitting Leave Type DTO:", data);
    return this.http.post<LeaveTypeResponse>('https://localhost:7241/api/v0/LeaveType', data);
  }

  GetLeaveTypes(): Observable<GetLeaveTypesList> {
    return this.http.get<GetLeaveTypesList>(
      'https://localhost:7241/api/v0/LeaveType'
    )
  }

  UpdateLeaveTypeById(leaveTypeId: string, data: UpdateLeaveTypeDto): Observable<LeaveTypeResponse> {
    return this.http.put<LeaveTypeResponse>(` https://localhost:7241/api/v0/LeaveType/${leaveTypeId}`, data)
  } 

  DeleteLeaveTypeById(leaveTypeId: string): Observable<DeleteLeaveTypeResponse> {
    return this.http.delete<DeleteLeaveTypeResponse>(` https://localhost:7241/api/v0/LeaveType/${leaveTypeId}`)
  } 
}

export class GetLeaveTypesList {
  message!: string;
  success!: boolean;
  data!: Array<{
    id: string;
    name: string;
    description: string;
    isPaid: string;
    requiresAttachments: boolean;
    isActive: boolean;
  }>
}