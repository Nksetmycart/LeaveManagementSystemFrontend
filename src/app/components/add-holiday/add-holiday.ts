import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HolidayService, CreateHolidayDto } from '../../services/holiday-service';

@Component({
  selector: 'app-add-holiday',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-holiday.html',
  styleUrl: './add-holiday.css',
})
export class AddHoliday {
  isSubmitting = false;

  notification = {
    show: false,
    type: 'success' as 'success' | 'danger',
    message: ''
  };

  holidayData: CreateHolidayDto = {
    name: '',
    type: 'Public', // Set standard layout default value selection
    date: ''
  };

  constructor(
    private holidayService: HolidayService,
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

    this.holidayService.CreateHoliday(this.holidayData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.showNotification('success', res.message || 'Holiday created successfully!');
        
        setTimeout(() => {
          this.router.navigate(['/dashboard/holidays']);
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.log('API execution error:', err);
        this.showNotification('danger', err.error.message);
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