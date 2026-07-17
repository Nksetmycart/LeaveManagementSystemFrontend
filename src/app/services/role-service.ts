import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export class AddRoleDto {
  name!: string;
  isActive!: boolean;
}

export class RoleResponse {
  success!: boolean;
  message!: string;
  data!: string;
}

export class GetRolesList {
  data!: Array<{
    id: string;
    name: string;
    isActive: boolean;
  }>;
  success!: boolean;
  message!: string;
}

export interface UpdateRoleDto {
    id: string;
    name: string;
    isActive: boolean;
}

export interface DeleteRoleResponse{
   success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  // Correct base target URL endpoint configuration
  private apiUrl = 'https://localhost:7241/api/v0/Role';

  constructor(private http: HttpClient) { }

  // Methods now properly live inside the Injectable service container
  CreateRole(data: AddRoleDto): Observable<RoleResponse> {
    console.log("Submitting custom role mapping data:", data);
    return this.http.post<RoleResponse>(this.apiUrl, data);
  }

  GetRoles(): Observable<GetRolesList> {
    return this.http.get<GetRolesList>(this.apiUrl);
  }

  UpdateRoleById(roleId: string, data: UpdateRoleDto): Observable<RoleResponse> {
    return this.http.put<RoleResponse>(`${this.apiUrl}/${roleId}`, data)
  }

  DeleteRoleById(roleId: string): Observable<DeleteRoleResponse>{
    return this.http.delete<DeleteRoleResponse>(`${this.apiUrl}/${roleId}`)
  }
}