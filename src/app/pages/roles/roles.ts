import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'; // Injected template form modules
import { RouterLink } from "@angular/router";
import { RoleService, GetRolesList } from '../../services/role-service';

export interface BackendRoleRecord {
  id: string;
  name: string;
  isActive: boolean;
}

export interface UpdateRole {
  id: string;
  name: string;
  isActive: boolean;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './roles.html',
  styleUrl: './roles.css',
})
export class Roles implements OnInit {
  
  roleList: BackendRoleRecord[] = [];
  apiResponse!: GetRolesList;

  // Confirmation Modal Internal Metrics States
  showConfirmationModal = false;
  roleToDelete: BackendRoleRecord | null = null;

  // Update Form Card Popup States
  showUpdateModal = false;
  editRoleData: UpdateRole | null = null;
  isSubmitting = false;

  // Error Alert Overlay States
  showErrorModal = false;
  apiErrorMessage = '';

  constructor(private roleService: RoleService) {}

  ngOnInit(): void {
    this.loadAllRoles();
  }

  loadAllRoles(): void {
    this.roleService.GetRoles().subscribe({
      next: (response) => {
        this.apiResponse = response;
        this.roleList = response.data;
        console.log("Roles fetched successfully from API stream:", this.roleList);
      },
      error: (error) => {
        console.error("Error retrieving custom security profiles list:", error);
      }
    });
  }

  viewRoleDetails(role: BackendRoleRecord): void {
    console.log(`Loading metrics overview for role identifier: ${role.name}`);
  }

  // --- POPUP CONTROLLERS INTERACTION PIPELINES ---
  openDeleteConfirmation(role: BackendRoleRecord): void {
    this.roleToDelete = role;
    this.showConfirmationModal = true;
  }

  closeDeleteConfirmation(): void {
    this.showConfirmationModal = false;
    this.roleToDelete = null;
  }

  openUpdateModal(role: BackendRoleRecord): void {
    // Isolated reference creation mapping to protect data states grid layouts until update commits
    this.editRoleData = {
      id: role.id,
      name: role.name,
      isActive: role.isActive
    };
    this.showUpdateModal = true;
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.editRoleData = null;
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
    if (form.invalid || !this.editRoleData) return;

    this.isSubmitting = true;

    // Call service update method structure, mapping the model requirements payload context
    this.roleService.UpdateRoleById(this.editRoleData.id, this.editRoleData).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        
        if (response && response.success === false) {
          this.openErrorPopup(response.message || 'The authorization tier endpoint rejected security profile alterations.');
          return;
        }

        console.log("Role policy parameter context altered successfully");
        this.loadAllRoles();
        this.closeUpdateModal();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error("Failed to commit network parameter edits context data rows:", err);
        const failureText = err?.error?.message || err?.message || 'A critical database transaction layer failure blocked access parameter update logs.';
        this.openErrorPopup(failureText);
      }
    });
  }

  confirmDelete(): void {
    if (!this.roleToDelete) return;

    const targetId = this.roleToDelete.id;
    const targetName = this.roleToDelete.name;
    
    console.log(`Initiating role deletion verification check block sequence for: ${targetName}`);
    this.closeDeleteConfirmation();

    this.roleService.DeleteRoleById(targetId).subscribe({
      next: (response: any) => {
        if (response && response.success === false) {
          this.openErrorPopup(response.message || `Could not remove role "${targetName}" from system memory schemas.`);
          return;
        }
        
        console.log("Delete transaction sequence executed cleanly.");
        this.roleList = this.roleList.filter(r => r.id !== targetId);
      },
      error: (err) => {
        console.error("Could not drop data record row:", err);
        const failureMessage = err?.error?.message || err?.message || 'A transaction drop execution barrier exception derailed the resource removal pipeline.';
        this.openErrorPopup(failureMessage);
      }
    });
  }
}