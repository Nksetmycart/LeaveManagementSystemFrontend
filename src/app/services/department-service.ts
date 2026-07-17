import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface DeleteDepartmentResponse {
  success: boolean;
  message: string;
}

export interface CreateDepartment {
  name: string;
  description: string;
}

export interface UpdateDepartmentDto {
  name: string;
  description: string;
}

export interface DepartmentResponse {
  message: string;
  success: boolean;
  data: string;
}

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  constructor(private http: HttpClient) {}

  CreateDepartment(data: CreateDepartment): Observable<DepartmentResponse> {
    console.log("CreateDepartmentData: ",data)
    return this.http.post<DepartmentResponse>(
      'https://localhost:7241/api/v0/Department',
      data,
    );
  }

  GetAllDepartments(): Observable<GetDepartmentsList> {
    return this.http.get<GetDepartmentsList> (
      'https://localhost:7241/api/v0/Department'
    );
  }

  DeleteDepartmentById(departmentId: string): Observable<DeleteDepartmentResponse> {
    return this.http.delete<DeleteDepartmentResponse> (`https://localhost:7241/api/v0/Department/${departmentId}`)
  }

  UpdateDepartmentById(data: UpdateDepartmentDto, departmentId: string): Observable<DepartmentResponse> {
    return this.http.put<DepartmentResponse> (`https://localhost:7241/api/v0/Department/${departmentId}`, data);
  }

}



export class GetDepartmentsList {
  data!: Array<{
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  }>
  message!: string;
  success!: boolean;
}