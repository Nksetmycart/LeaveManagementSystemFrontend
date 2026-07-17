import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class AttendanceService {
  private apiUrl = 'https://localhost:7241/api/v0/Attendance';

  constructor(private http: HttpClient){}

  GetAttendanceByEmployee(employeeId?: string): Observable<AttendanceListResponse> {
    return this.http.get<AttendanceListResponse>(`${this.apiUrl}/${employeeId}`);
  }

  MarkAttendance(data: MarkAttendance, employeeId?: string):  Observable<MarkAttendanceResponse> {
    return this.http.post<MarkAttendanceResponse>(`${this.apiUrl}/${employeeId}`,data);
  }

  MarkBulkAttendance(data: MarkAttendance[], employeeId?: string): Observable<MarkAttendanceListResponse> {
    return this.http.post<MarkAttendanceListResponse>(`${this.apiUrl}/${employeeId}/bulk`, data);
  }
}

export interface MarkAttendance{
  attendanceDate: string;
  status: string;
}

export interface MarkAttendanceResponse {
  success: boolean;
  message: string;
  data: string;
}
export interface MarkAttendanceListResponse {
  success: boolean;
  message: string;
  data: string[];
}

export interface AttendanceListResponse{
  success: boolean;
  message: string;
  data: Array<{
    id: string;
    companyId: string;
    employeeName: string;
    attendanceDate: Date;
    status: string;
    createdAt: Date;
  }>

}