import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EmployeeService, CreateEmployeeDto } from '../../services/employee-service';
import { DepartmentService } from '../../services/department-service';
import { RoleService } from '../../services/role-service';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-employee.html',
  styleUrl: './add-employee.css',
})
export class AddEmployee implements OnInit {
  isSubmitting = false;

  notification = {
    show: false,
    type: 'success' as 'success' | 'danger',
    message: ''
  };

  employeeData!: CreateEmployeeDto;
  departments: any[] = [];
  roles: any[] = [];

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private roleService: RoleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initDefaultData();
    this.loadDropdownData();
  }

  // Gets the current date formatted perfectly for input type="datetime-local"
  getPickerDefaultDate(): string {
    return new Date().toISOString().substring(0, 16);
  }

  initDefaultData(): void {
    this.employeeData = {
      departmentId: '',
      roleId: '',
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
      address: '',
      joiningDate: this.getPickerDefaultDate()
    };
  }

  loadDropdownData(): void {
    this.departmentService.GetAllDepartments().subscribe({
      next: (res) => this.departments = res.data,
      error: (err) => console.error('Error fetching departments:', err)
    });

    this.roleService.GetRoles().subscribe({
      next: (res) => this.roles = res.data,
      error: (err) => console.error('Error fetching roles:', err)
    });
  }

  // Clean form clear handler to avoid logic execution errors in HTML template
  clearForm(form: NgForm): void {
    form.resetForm();
    this.initDefaultData();
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => form.controls[key].markAsTouched());
      return;
    }

    this.isSubmitting = true;
    this.closeNotification();

    const payload: CreateEmployeeDto = {
      ...this.employeeData,
      joiningDate: new Date(this.employeeData.joiningDate).toISOString()
    };

    this.employeeService.CreateEmployee(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.showNotification('success', response.message || 'Employee onboarded successfully!');
        this.clearForm(form);

        setTimeout(() => {
          this.router.navigate(['/dashboard/employees']);
        }, 1500);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Registration failure:', error);
        this.showNotification('danger', 'Failed to onboard employee.');
      }
    });
  }

  showNotification(type: 'success' | 'danger', message: string): void {
    this.notification = { show: true, type, message };
  }

  closeNotification(): void {
    this.notification.show = false;
  }
}