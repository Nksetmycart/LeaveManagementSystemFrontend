import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  loginUser(data: LoginUser): Observable<UserResponse>{
    return this.http.post<UserResponse>('https://localhost:7241/api/v0/Auth/login',data);
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user')!);
  }

  getEmployeeId(): string {
    return this.getUser().employeeId;
  }

  getCompanyId(): string | null {
    return this.getUser()!.companyId;
  }

  getRole() {
    return this.getUser()!.role;
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  isLoggedIn() {
    return !!localStorage.getItem("token");
  }

  logout() {
    localStorage.clear();
  }
}

export class LoginUser {
  email!: string;
  password!: string;
}

export class UserResponse{
  data!: {
    employeeId: string,
    name: string;
    email: string;
    companyId: string;
    phoneNumber: number;
    role: string;
    token: string;
    userId: string;
  }
  message!: string;
  success!: boolean;
}