import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  constructor(private http: HttpClient) {}

  createDepartment(data: CreateDepartment): Observable<CreateDepartmentResponse> {
    console.log("CreateDepartmentData: ",data)
    return this.http.post<CreateDepartmentResponse>(
      'https://localhost:7241/api/v0/Department',
      data,
    );
  }

  GetAllDepartments(): Observable<GetDepartmentsList> {
    return this.http.get<GetDepartmentsList> (
      'https://localhost:7241/api/v0/Department'
    );
  }

}

export class CreateDepartment {
  name!: string;
  description!: string;
}

export class CreateDepartmentResponse {
  message!: string;
  success!: boolean;
  data!: string;
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