import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-leave-types',
  imports: [CommonModule, RouterLink],
  templateUrl: './leave-types.html',
  styleUrl: './leave-types.css',
})
export class LeaveTypes {
// Pre-configured list matching your exact system structures
  leaveTypesList: LeaveType[] = [
    { id: 1, name: 'Casual Leave', code: 'C L', annualDays: 12, isCarryForward: false, colorAccent: '#2b6cb0' },
    { id: 2, name: 'Sick Leave', code: 'S L', annualDays: 10, isCarryForward: false, colorAccent: '#38a169' },
    { id: 3, name: 'Earned Leave', code: 'E L', annualDays: 15, isCarryForward: true, colorAccent: '#dd6b20' },
    { id: 4, name: 'Loss of Pay', code: 'L O P', annualDays: 30, isCarryForward: false, colorAccent: '#e53e3e' }
  ];

  navigateToAddLeaveType(): void {
    console.log('Opening layout dashboard form to configure a new operational leave policy...');
  }

  viewLeaveTypeDetails(type: LeaveType): void {
    console.log(`Loading precise configuration constraints and historic usage indices for leave type: ${type.name}`);
  }

  updateLeaveType(type: LeaveType): void {
    console.log(`Launching contextual editor metadata settings for: ${type.name}`);
  }

  deleteLeaveType(type: LeaveType): void {
    console.log(`Initiating leave type deletion routine check blocks for: ${type.name}`);
    if (confirm(`Are you sure you want to delete the leave configuration rules for ${type.name}?`)) {
      this.leaveTypesList = this.leaveTypesList.filter(t => t.id !== type.id);
    }
  }
}

interface LeaveType {
  id: number;
  name: string;
  code: string;
  annualDays: number;
  isCarryForward: boolean;
  colorAccent: string;
}