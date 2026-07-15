import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-employee',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-employee.html',
  styleUrl: './add-employee.css',
})
export class AddEmployee {
// Bindable data object initialized to mirror your payload layout
  employeeData = {
    departmentId: '',
    roleId: '',
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    joiningDate: new Date().toISOString().substring(0, 16) // Initial format for datetime-local picker
  };

  isSubmitting = false;

  departments = [
    { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Engineering' },
    { id: 'a4b25f64-1217-4562-b3fc-2c963f66afb2', name: 'Design' },
    { id: 'c8d15f64-8917-4562-b3fc-2c963f66afc9', name: 'People Ops' }
  ];

  roles = [
    { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'HR Admin' },
    { id: 'b2c35f64-4317-4562-b3fc-2c963f66afd4', name: 'Manager' },
    { id: 'd4e55f64-7617-4562-b3fc-2c963f66afe5', name: 'Employee' }
  ];

  constructor(private http: HttpClient) {}

  onSubmit(form: any): void {
    // Check if the template form validation passed
    if (form.invalid) {
      // Force status update to display visual error highlights
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    // Create a copy of the payload to transform the joiningDate to standard ISO format
    const payload = { ...this.employeeData };
    payload.joiningDate = new Date(payload.joiningDate).toISOString();

    const backendUrl = 'https://api.leaveflow.io/api/v1/employees'; // Swap with your actual API endpoint

    this.http.post(backendUrl, payload).subscribe({
      next: (response) => {
        console.log('Employee successfully added to backend:', response);
        alert('Employee onboarding created successfully!');
        
        // Reset local data properties
        form.resetForm({
          joiningDate: new Date().toISOString().substring(0, 16)
        });
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Backend operation failed:', error);
        alert('Failed to register employee. Please check network connections.');
        this.isSubmitting = false;
      }
    });
  }
}
