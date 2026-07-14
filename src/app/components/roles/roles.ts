import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-roles',
  imports: [CommonModule],
  templateUrl: './roles.html',
  styleUrl: './roles.css',
})
export class Roles {
  // Dynamic Array containing structured sample data for access roles
  roleList: Role[] = [
    { 
      id: 1, 
      name: 'HR Admin', 
      userCount: 1, 
      permissions: ['All Operations', 'Manage Employees', 'Approve Leaves', 'System Configurations'] 
    },
    { 
      id: 2, 
      name: 'Manager', 
      userCount: 1, 
      permissions: ['Team Overview', 'Approve Leaves', 'View Department Profiles'] 
    },
    { 
      id: 3, 
      name: 'Employee', 
      userCount: 3, 
      permissions: ['Apply Leaves', 'View Personal Balance', 'Log Attendance'] 
    }
  ];

  navigateToAddRole(): void {
    console.log('Opening workflow builder to instantiate a new access role...');
  }

  viewRoleDetails(role: Role): void {
    console.log(`Loading precise permissions matrices and assigned active employee roster for role: ${role.name}`);
  }

  updateRole(role: Role): void {
    console.log(`Launching inline administrative metadata policy modifier for: ${role.name}`);
  }

  deleteRole(role: Role): void {
    console.log(`Initiating role deletion sequence or safety prompt checks for: ${role.name}`);
    if (confirm(`Are you sure you want to delete the ${role.name} role?`)) {
      this.roleList = this.roleList.filter(r => r.id !== role.id);
    }
  }
}

interface Role {
  id: number;
  name: string;
  userCount: number;
  permissions: string[];
}