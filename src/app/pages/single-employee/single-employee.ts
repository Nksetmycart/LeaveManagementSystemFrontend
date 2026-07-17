import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EmployeeService, EmployeeResponseDto } from '../../services/employee-service';
import { Attendance } from "../../components/attendance/attendance";

@Component({
  selector: 'app-single-employee',
  standalone: true,
  imports: [CommonModule, RouterLink, Attendance],
  templateUrl: './single-employee.html',
  styleUrl: './single-employee.css',
})
export class SingleEmployee implements OnInit {
  isLoading = true;
  employee: EmployeeResponseDto | null = null;
  errorMessage = '';
  employeeId!: string;

  constructor(
    private employeeService: EmployeeService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Read the "id" parameter from the active route URL mapping
    const Id = this.route.snapshot.paramMap.get('id');
    
    if (Id) {
      this.employeeId = Id;
      this.fetchEmployeeDetails(Id);
    } else {
      // If no ID is explicitly in the URL, attempt an authenticated context lookup fallback
      this.fetchEmployeeDetails();
    }
  }

  fetchEmployeeDetails(id?: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.employeeService.GetEmployeeById(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.employee = response.data;
          this.employeeService.setEmployee(this.employee);
        } else {
          this.errorMessage = response.message || 'Failed to retrieve profile record.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching employee details:', error);
        this.errorMessage = 'A network exception occurred while fetching personnel information.';
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return 'EE';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}