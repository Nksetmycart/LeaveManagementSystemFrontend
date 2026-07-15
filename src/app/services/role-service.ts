import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  constructor(private http: HttpClient) {}

  createRole(data: CreateRole): Observable<any> {
    console.log("CreateRoleDa")
    return this.http.post<any>('https://localhost:7241/api/v0/Department',data)
  }
}

export class CreateRole{

}

