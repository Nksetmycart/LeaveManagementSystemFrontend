import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DepartmentResponse, DepartmentService } from '../../services/department-service';

@Component({
  selector: 'app-add-department',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-department.html',
  styleUrl: './add-department.css',
})
export class AddDepartment {
  departmentData = {
    name: '',
    description: ''
  };
  isSubmitting = false;

  // Toast notification state
  toast = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'danger'
  };

  constructor(private departmentService: DepartmentService) {}

  showNotification(message: string, type: 'success' | 'danger') {
    this.toast = { show: true, message, type };
    
    // Automatically hide the notification after 4 seconds
    setTimeout(() => {
      this.toast.show = false;
    }, 4000);
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    this.departmentService.CreateDepartment(this.departmentData).subscribe({
      next: (response: DepartmentResponse) => {
        this.isSubmitting = false;
        
        // Success Popup configuration
        this.showNotification(
          `Department "${response.data || this.departmentData.name}" has been created successfully.`, 
          'success'
        );
        
        form.resetForm();
        this.departmentData = { name: '', description: '' };
      },
      error: (err: any) => {
        this.isSubmitting = false;
        
        // Failure Popup configuration
        this.showNotification(
          `Failed to create department: ${err.message || 'Server error'}`, 
          'danger'
        );
      }
    });
  }
}