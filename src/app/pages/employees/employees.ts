import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EmployeeService, EmployeeResponseDto } from '../../services/employee-service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees implements OnInit {
  
  employeeList: EmployeeResponseDto[] = [];

  // Popup Modal Operational State Tracking Metrics Variables
  showConfirmationModal = false;
  employeeToDelete: EmployeeResponseDto | null = null;

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.GetEmployees().subscribe({
      next: (response) => {
        if (response.success) {
          this.employeeList = response.data;
          console.log("Employees grid mapped smoothly:", this.employeeList);
        }
      },
      error: (error) => {
        console.error("Error pulling database personnel matrix profiles:", error);
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

  updateEmployee(employee: EmployeeResponseDto): void {
    console.log('Opening administrative patch update matrix settings for:', employee.name);
    this.router.navigate(['/dashboard/employees/edit', employee.id]);
  }

  // --- POPUP MODAL CONTROLLERS ---
  openDeleteConfirmation(employee: EmployeeResponseDto): void {
    this.employeeToDelete = employee;
    this.showConfirmationModal = true;
  }

  closeDeleteConfirmation(): void {
    this.showConfirmationModal = false;
    this.employeeToDelete = null;
  }

  confirmDelete(): void {
    if (!this.employeeToDelete) return;
    this.employeeService.DeleteEmployeeById(this.employeeToDelete.id).subscribe({
      next: () => {
        this.employeeList = this.employeeList.filter(e => e.id !== this.employeeToDelete!.id);
        console.log(`Profile index matching ${this.employeeToDelete!.name} dropped successfully.`);
        this.closeDeleteConfirmation();
      },
      error: (err) => {
        console.log("Failed executing delete parameters pipeline context rule checks:", err);
        this.closeDeleteConfirmation();
      }
    });
  }
}