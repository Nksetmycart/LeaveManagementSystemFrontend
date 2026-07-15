import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface QuickBalance {
  name: string;
  remaining: number;
  total: number;
  color: string;
}

interface MiniHoliday {
  name: string;
  date: string;
}

@Component({
  selector: 'app-home-component',
  imports: [CommonModule, RouterLink],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {
  employeeId!: string;
 // Dynamic Array mapping data points internally inside card blocks
  quickBalances: QuickBalance[] = [
    { name: 'Casual Leave', remaining: 12, total: 12, color: '#2b6cb0' },
    { name: 'Sick Leave', remaining: 10, total: 10, color: '#38a169' },
    { name: 'Earned Leave', remaining: 15, total: 15, color: '#dd6b20' }
  ];

  miniHolidays: MiniHoliday[] = [
    { name: 'Independence Day', date: 'Aug 15' },
    { name: 'Gandhi Jayanti', date: 'Oct 02' },
    { name: 'Diwali', date: 'Nov 01' },
    { name: 'Christmas Day', date: 'Dec 25' }
  ];

  navigateToApplyLeave(): void {
    console.log('Routing navigation link direction engine execution to: Apply Leave page context.');
  }

  navigateToMarkAttendance(): void {
    console.log('Routing navigation link direction engine execution to: Attendance logging tracking grid context.');
  }
}
