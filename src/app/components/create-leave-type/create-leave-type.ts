import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LeaveService, LeaveTypeDto } from '../../services/leave-service';

@Component({
  selector: 'app-create-leave-type',
  standalone: true, // Ensured explicit standalone structure flag is set
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-leave-type.html',
  styleUrl: './create-leave-type.css',
})
export class CreateLeaveType {
  isSubmitting = false;

  // Uses the shared layout structure imported directly from the service
  leaveData: LeaveTypeDto = {
    name: '',
    description: '',
    isPaid: true,
    isActive: true,
    reqiresAttachment: false
  };

  constructor(
    private router: Router,
    private leaveService: LeaveService
  ) {}

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    // Direct subscription hook into your real HTTP post pipeline
    this.leaveService.CreateLeaveType(this.leaveData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        alert(res.message || 'Leave policy created successfully!');
        this.router.navigate(['/dashboard/leaves']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Backend submission failure:', err);
        alert('Failed to create the leave type. Please verify parameters.');
      }
    });
  }
}