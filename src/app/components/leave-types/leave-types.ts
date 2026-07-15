import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LeaveService, GetLeaveTypesList } from '../../services/leave-service';

// Interface matching the explicit data model array layout returned from your backend API
export interface LeaveTypeRecord {
  id: string;
  name: string;
  description: string;
  isPaid: string; // Keeping 'string' as defined in your GetLeaveTypesList structure
  requiresAttachments: boolean;
  isActive: boolean;
}

@Component({
  selector: 'app-leave-types',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './leave-types.html',
  styleUrl: './leave-types.css',
})
export class LeaveTypes implements OnInit {
  
  leaveTypesList: LeaveTypeRecord[] = [];
  apiResponse!: GetLeaveTypesList;

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.loadLeaveTypes();
  }

  loadLeaveTypes(): void {
    this.leaveService.GetLeaveTypes().subscribe({
      next: (response) => {
        this.apiResponse = response;
        this.leaveTypesList = response.data;
        console.log("Leave Types Loaded successfully: ", this.leaveTypesList);
      },
      error: (error) => {
        console.error("Error Fetching Leave Types List from server:", error);
      }
    });
  }

  viewLeaveTypeDetails(type: LeaveTypeRecord): void {
    console.log(`Loading precise configuration constraints for leave type: ${type.name}`);
  }

  updateLeaveType(type: LeaveTypeRecord): void {
    console.log(`Launching contextual editor metadata settings for: ${type.name}`);
  }

  deleteLeaveType(type: LeaveTypeRecord): void {
    console.log(`Initiating leave type deletion routine check blocks for: ${type.name}`);
    if (confirm(`Are you sure you want to delete the leave configuration rules for "${type.name}"?`)) {
      // Logic placeholder for your live API service pipeline hook:
      // this.leaveService.DeleteLeaveType(type.id).subscribe({
      //   next: () => this.loadLeaveTypes(),
      //   error: (err) => console.error("Error deleting record", err)
      // });
      
      // Temporary optimistic offline local filter array cleanup fallback
      this.leaveTypesList = this.leaveTypesList.filter(t => t.id !== type.id);
    }
  }
}