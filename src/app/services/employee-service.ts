import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  constructor(private http: HttpClient) {}

  createEmployee(data: createEmployee): Observable<string> {
    return this.http.post<string>('https://localhost:7241/api/v0/Employee', data);
  }
  
}

export class createEmployee {

}