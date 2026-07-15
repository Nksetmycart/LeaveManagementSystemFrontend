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

export interface CreateLeaveTypeResponse {
  message: string;
  success: boolean;
  data: string;
}

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  constructor(private http: HttpClient) {}

  CreateLeaveType(data: LeaveTypeDto): Observable<CreateLeaveTypeResponse> {
    console.log("Submitting Leave Type DTO:", data);
    return this.http.post<CreateLeaveTypeResponse>('https://localhost:7241/api/v0/LeaveType', data);
  }
}