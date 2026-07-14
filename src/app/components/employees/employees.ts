import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employees',
  imports: [CommonModule],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees {
 constructor(private router: Router) {}

  employeeList: Employee[] = [
    {
      id: 1,
      name: 'Priya Sharma',
      role: 'Head of People',
      department: 'PEOPLE OPS',
      clearance: 'HR ADMIN',
      avatarUrl: 'assets/priya.jpg'
    },
    {
      id: 2,
      name: 'Aarav Mehta',
      role: 'Engineering Manager',
      department: 'ENGINEERING',
      clearance: 'MANAGER',
      avatarUrl: 'assets/aarav.jpg'
    },
    {
      id: 3,
      name: 'Emma Watson',
      role: 'Senior Engineer',
      department: 'ENGINEERING',
      clearance: 'EMPLOYEE',
      avatarUrl: 'assets/emma.jpg'
    },
    {
      id: 4,
      name: 'Liam Chen',
      role: 'Software Engineer',
      department: 'ENGINEERING',
      clearance: 'EMPLOYEE',
      initials: 'LI'
    },
    {
      id: 5,
      name: 'Ava Rodriguez',
      role: 'Product Designer',
      department: 'DESIGN',
      clearance: 'EMPLOYEE',
      initials: 'AV'
    }
  ];

  navigateToAddEmployee(): void {
    console.log('Navigating to Add Employee workflow form page...');
    // this.router.navigate(['/employees/add']);
  }

  viewDetails(employee: Employee): void {
    console.log('Opening target contextual details view profile for:', employee.name);
    // this.router.navigate(['/employees/details', employee.id]);
  }

  updateEmployee(employee: Employee): void {
    console.log('Opening administrative patch update matrix settings for:', employee.name);
    // this.router.navigate(['/employees/edit', employee.id]);
  }
}

interface Employee {
  id: number;
  name: string;
  role: string;
  department: string;
  clearance: string;
  avatarUrl?: string;
  initials?: string;
}