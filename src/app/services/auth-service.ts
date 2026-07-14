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
    phoneNumber: number;
    role: string;
    token: string;
    userId: string;
  }
  response!: string;
  success!: boolean;
}