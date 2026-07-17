import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; // <-- 1. Imported ActivatedRoute
import { EmployeeResponseDto, EmployeeService, UpdateEmployeeDto } from '../../services/employee-service';
import { DepartmentService } from '../../services/department-service';
import { RoleService } from '../../services/role-service';

@Component({
  selector: 'app-update-employee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-employee.html',
  styleUrl: './update-employee.css',
})
export class UpdateEmployee implements OnInit {
  newEmployeeData!: UpdateEmployeeDto;
  employeeData!: EmployeeResponseDto | null;
  departments: any[] = [];
  roles: any[] = [];

  isLoading = true; // <-- 2. Set to true by default while loading profiles
  isSubmitting = false;
  errorMessage = '';
  employeeId!: string;

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private roleService: RoleService,
    private router: Router,
    private route: ActivatedRoute, // <-- 3. Injected ActivatedRoute
    private location: Location
  ) {}
  
  ngOnInit(): void {
    // 4. Extract target ID directly from route snapshot parameters
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      this.employeeId = idParam;
      this.loadDropdownData();
      this.resolveEmployeeProfile();
    } else {
      this.errorMessage = 'No valid employee identifier found in the URL parameter map.';
      this.isLoading = false;
    }
  }

  private resolveEmployeeProfile(): void {
    // Check if the service already has the employee in-memory
    this.employeeData = this.employeeService.getEmployee();

    // 5. If it's a browser reload, fetch data directly from the API backend
    if (!this.employeeData || this.employeeData.id !== this.employeeId) {
      this.employeeService.GetEmployeeById(this.employeeId).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.employeeData = response.data;
            this.employeeService.setEmployee(this.employeeData); // Synchronize state back to cache
            this.initDefaultData();
          } else {
            this.errorMessage = response.message || 'Failed to retrieve profile record on page refresh.';
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Error handling refresh recovery lookup:', err);
          this.errorMessage = 'Network exception occurred recovering employee profile state.';
          this.isLoading = false;
        }
      });
    } else {
      // Data exists in memory cache, initialize immediately
      this.initDefaultData();
    }
  }

  loadDropdownData(): void {
    this.departmentService.GetAllDepartments().subscribe({
      next: (res) => {
        this.departments = res.data;
        this.matchDepartmentSelection();
      },
      error: (err) => console.error("Error fetching departments:", err)
    });

    this.roleService.GetRoles().subscribe({
      next: (res) => {
        this.roles = res.data;
        this.matchRoleSelection();
      },
      error: (err) => console.error('Error fetching roles:', err)
    });
  }

  initDefaultData(): void {
    if (!this.employeeData) return;

    this.newEmployeeData = {
      name: this.employeeData.name || '',
      email: this.employeeData.email || '',
      phoneNumber: this.employeeData.phoneNumber || '',
      address: this.employeeData.address || '',
      departmentId: '', // Resolved asynchronously via dropdown matcher
      roleId: '',       // Resolved asynchronously via dropdown matcher
      joiningDate: this.employeeData.joiningDate ? new Date(this.employeeData.joiningDate).toISOString().split('T')[0] : ''
    };

    // Attempt matching selections if arrays are already fetched
    this.matchDepartmentSelection();
    this.matchRoleSelection();
    this.isLoading = false;
  }

  private matchDepartmentSelection(): void {
    if (this.departments.length > 0 && this.employeeData?.department && this.newEmployeeData) {
      const matched = this.departments.find(
        d => d.name.trim().toLowerCase() === this.employeeData!.department.trim().toLowerCase()
      );
      if (matched) {
        this.newEmployeeData.departmentId = matched.id;
      }
    }
  }

  private matchRoleSelection(): void {
    if (this.roles.length > 0 && this.employeeData?.role && this.newEmployeeData) {
      const matched = this.roles.find(
        r => r.name.trim().toLowerCase() === this.employeeData!.role.trim().toLowerCase()
      );
      if (matched) {
        this.newEmployeeData.roleId = matched.id;
      }
    }
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || !this.employeeData) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const finalPayload: UpdateEmployeeDto = {
      ...this.newEmployeeData,
      joiningDate: new Date(this.newEmployeeData.joiningDate).toISOString()
    };

    this.employeeService.UpdateEmployeeById(finalPayload, this.employeeData.id).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          alert(response.message || 'Employee metrics successfully altered.');
          this.router.navigate(['/dashboard/employees', this.employeeData?.id]);
        } else {
          this.errorMessage = response.message || 'Failed to apply update parameters context rules.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('An error exception dropped updates transaction pipeline logs:', err);
        this.errorMessage = 'A service execution barrier error dropped your modification request.';
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}