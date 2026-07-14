import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-leaves',
  imports: [CommonModule],
  templateUrl: './my-leaves.html',
  styleUrl: './my-leaves.css',
})
export class MyLeaves {
// Dynamic Array containing sample historical logs. To view the empty state from your screenshot, simply set this to an empty array: []
  leaveHistory: LeaveRecord[] = [
    {
      type: 'Earned Leave',
      from: '2026-07-26',
      to: '2026-07-28',
      days: 3,
      reason: 'Vacation with family',
      applied: '12/07/2026',
      status: 'Pending'
    },
    {
      type: 'Sick Leave',
      from: '2026-05-12',
      to: '2026-05-13',
      days: 1.5,
      reason: 'Doctor consultation & rest',
      applied: '12/05/2026',
      status: 'Approved'
    },
    {
      type: 'Casual Leave',
      from: '2026-03-05',
      to: '2026-03-05',
      days: 1,
      reason: 'Urgent personal work at home',
      applied: '04/03/2026',
      status: 'Rejected'
    }
  ];

  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved': return 'bg-success-subtle text-success';
      case 'Pending': return 'bg-warning-subtle text-warning-emphasis';
      case 'Rejected': return 'bg-danger-subtle text-danger';
      default: return 'bg-secondary-subtle text-secondary';
    }
  }
}

interface LeaveRecord {
  type: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  applied: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}