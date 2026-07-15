import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { RoleService, GetRolesList } from '../../services/role-service';

// Interface matching the array elements returned inside GetRolesList.data
export interface BackendRoleRecord {
  id: string;
  name: string;
  isActive: boolean;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './roles.html',
  styleUrl: './roles.css',
})
export class Roles implements OnInit {
  
  // Real database-driven array reference state
  roleList: BackendRoleRecord[] = [];
  apiResponse!: GetRolesList;

  constructor(private roleService: RoleService) {}

  ngOnInit(): void {
    this.loadAllRoles();
  }

  loadAllRoles(): void {
    this.roleService.GetRoles().subscribe({
      next: (response) => {
        this.apiResponse = response;
        this.roleList = response.data;
        console.log("Roles fetched successfully from API stream:", this.roleList);
      },
      error: (error) => {
        console.error("Error retrieving custom security profiles list:", error);
      }
    });
  }

  viewRoleDetails(role: BackendRoleRecord): void {
    console.log(`Loading metrics overview for role identifier: ${role.name}`);
  }

  updateRole(role: BackendRoleRecord): void {
    console.log(`Launching inline administrative metadata policy modifier for: ${role.name}`);
  }

  deleteRole(role: BackendRoleRecord): void {
    console.log(`Initiating role deletion verification check block sequence for: ${role.name}`);
    if (confirm(`Are you sure you want to delete the security role "${role.name}"?`)) {
      // Logic binding placeholder for the DELETE request matching your service schema setup:
      // this.roleService.DeleteRole(role.id).subscribe({
      //   next: () => this.loadAllRoles(),
      //   error: (err) => console.error("Could not drop data record row:", err)
      // });

      // Local optimistic ui updates fallback filtering criteria
      this.roleList = this.roleList.filter(r => r.id !== role.id);
    }
  }
}