import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoleService, AddRoleDto } from '../../services/role-service';

@Component({
  selector: 'app-add-role',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-role.html',
  styleUrl: './add-role.css',
})
export class AddRole {
  isSubmitting = false;

  // Handles contextual banner tracking state
  notification = {
    show: false,
    type: 'success' as 'success' | 'danger',
    message: ''
  };

  // Bound to the template form via [(ngModel)]
  roleData: AddRoleDto = {
    name: '',
    isActive: true
  };

  constructor(
    private roleService: RoleService,
    private router: Router
  ) {}

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.closeNotification();

    // Call the newly fixed service layer stream execution target
    this.roleService.CreateRole(this.roleData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.showNotification('success', res.message || 'Role created successfully!');
        
        // Wait briefly so they can read the status block banner layout frame
        setTimeout(() => {
          this.router.navigate(['/dashboard/roles']);
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('API execution error:', err);
        this.showNotification('danger', 'Failed to provision the requested system access role.');
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