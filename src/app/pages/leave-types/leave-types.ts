import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LeaveService, GetLeaveTypesList } from '../../services/leave-service';

export interface LeaveTypeRecord {
  id: string;
  companyId: string;
  name: string;
  description: string;
  isPaid: boolean;              
  reqiresAttachment: boolean;   
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateLeaveType {
  name: string;
  description: string;
  isPaid: boolean;
  isActive: boolean;
  reqiresAttachment: boolean;
}

@Component({
  selector: 'app-leave-types',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './leave-types.html',
  styleUrl: './leave-types.css',
})
export class LeaveTypes implements OnInit {
  
  leaveTypesList: any[] = [];
  apiResponse!: GetLeaveTypesList;

  // Confirmation Modal State Variables
  showConfirmationModal = false;
  leaveTypeToDelete: LeaveTypeRecord | null = null;

  // Update Modal State Variables
  showUpdateModal = false;
  editLeaveTypeData: (UpdateLeaveType & { id: string }) | null = null;
  isSubmitting = false;

  // Error Alert State Variables
  showErrorModal = false;
  apiErrorMessage = '';

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

  // --- POPUP ACTION MODAL CONTROLLERS ---
  openDeleteConfirmation(type: LeaveTypeRecord): void {
    this.leaveTypeToDelete = type;
    this.showConfirmationModal = true;
  }

  closeDeleteConfirmation(): void {
    this.showConfirmationModal = false;
    this.leaveTypeToDelete = null;
  }

  openUpdateModal(type: LeaveTypeRecord): void {
    this.editLeaveTypeData = {
      id: type.id,
      name: type.name,
      description: type.description,
      isPaid: type.isPaid,
      isActive: type.isActive,
      reqiresAttachment: type.reqiresAttachment
    };
    this.showUpdateModal = true;
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.editLeaveTypeData = null;
    this.isSubmitting = false;
  }

  openErrorPopup(message: string): void {
    this.apiErrorMessage = message;
    this.showErrorModal = true;
  }

  closeErrorPopup(): void {
    this.showErrorModal = false;
    this.apiErrorMessage = '';
  }

  confirmUpdate(form: NgForm): void {
    if (form.invalid || !this.editLeaveTypeData) return;

    this.isSubmitting = true;
    const targetId = this.editLeaveTypeData.id;

    // Creating structured payload strictly matching the targeted updateDto format
    const payload: UpdateLeaveType = {
      name: this.editLeaveTypeData.name,
      description: this.editLeaveTypeData.description,
      isPaid: this.editLeaveTypeData.isPaid,
      isActive: this.editLeaveTypeData.isActive,
      reqiresAttachment: this.editLeaveTypeData.reqiresAttachment
    };

    // Assuming endpoint mapping design follows signature pattern: UpdateLeaveType(id, payload)
    this.leaveService.UpdateLeaveTypeById(targetId, payload).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        if (response && response.success === false) {
          this.openErrorPopup(response.message || 'The server validation rules rejected payload changes.');
          return;
        }
        this.loadLeaveTypes();
        this.closeUpdateModal();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Update configuration exception:', err);
        const text = err?.error?.message || err?.message || 'A sync failure aborted configuration changes.';
        this.openErrorPopup(text);
      }
    });
  }

  confirmDelete(): void {
    if (!this.leaveTypeToDelete) return;

    const targetId = this.leaveTypeToDelete.id;
    const targetName = this.leaveTypeToDelete.name;

    this.closeDeleteConfirmation();

    this.leaveService.DeleteLeaveTypeById(targetId).subscribe({
      next: (response: any) => {
        if (response && response.success === false) {
          this.openErrorPopup(response.message || `Could not remove leave configuration layer for "${targetName}".`);
          return;
        }
        this.leaveTypesList = this.leaveTypesList.filter(t => t.id !== targetId);
      },
      error: (err) => {
        console.log('Delete execution error context:', err);
        const message = err?.error?.message || err?.message || 'A network error interrupted the deletion process.';
        this.openErrorPopup(message);
      }
    });
  }
}