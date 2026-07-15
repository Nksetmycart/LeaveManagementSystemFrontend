import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LeaveService, LeaveTypeDto } from '../../services/leave-service';

@Component({
  selector: 'app-create-leave-type',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-leave-type.html',
  styleUrl: './create-leave-type.css',
})
export class CreateLeaveType {
  isSubmitting = false;

  // Track operational notifications locally rather than triggering native popups
  notification: { show: boolean; type: 'success' | 'danger'; message: string } = {
    show: false,
    type: 'success',
    message: ''
  };

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
    this.closeNotification();

    this.leaveService.CreateLeaveType(this.leaveData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        
        // Trigger a successful state notification layout block
        this.showNotification('success', res.message || 'Leave policy created successfully!');
        
        // Wait briefly so the user can see the green status banner before routing away
        setTimeout(() => {
          this.router.navigate(['/dashboard/leave-types']);
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Backend submission failure:', err);
        
        // Trigger an error state notification layout block
        this.showNotification('danger', 'Failed to create the leave type. Please verify parameters.');
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