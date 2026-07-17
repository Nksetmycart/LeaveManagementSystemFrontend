import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'; // <-- 1. Imported FormsModule
import { RouterLink } from "@angular/router";
import { DepartmentService, GetDepartmentsList } from '../../services/department-service';

export interface Department {
  id: string; 
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-departmens',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // <-- 2. Added FormsModule here
  templateUrl: './departmens.html',
  styleUrl: './departmens.css',
})
export class Departmens implements OnInit {

  departmentsList: any[] = [];
  data!: GetDepartmentsList;

  // Confirmation Modal State Variables
  showConfirmationModal = false;
  departmentToDelete: Department | null = null;

  // Update Modal State Variables
  showUpdateModal = false;
  editDepartmentData: { id: string, name: string, description: string } | null = null;
  isSubmitting = false;

  // Error Popup Modal State Variables
  showErrorModal = false;
  apiErrorMessage = '';

  constructor(private departmentService: DepartmentService) {}

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.departmentService.GetAllDepartments().subscribe({
      next: (response) => {
        this.data = response;
        this.departmentsList = response.data;
        console.log("Response: ", this.departmentsList);
      }, 
      error: (error) => {
        console.log("Error Fetching Departments List", error);
      }
    });
  }

  // --- POPUP MODAL CONTROLLERS ---
  openDeleteConfirmation(dept: Department): void {
    this.departmentToDelete = dept;
    this.showConfirmationModal = true;
  }

  closeDeleteConfirmation(): void {
    this.showConfirmationModal = false;
    this.departmentToDelete = null;
  }

  openUpdateModal(dept: Department): void {
    // Break reference by creating a cloned copy object so that input typing 
    // does not prematurely reflect changes on the background screen grid until saved successfully
    this.editDepartmentData = {
      id: dept.id,
      name: dept.name,
      description: dept.description
    };
    this.showUpdateModal = true;
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.editDepartmentData = null;
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
    if (form.invalid || !this.editDepartmentData) return;

    this.isSubmitting = true;

    // Check your department service for the exact edit update method name.
    // Making an architectural assumption that it resembles .UpdateDepartment(id, payload)
    this.departmentService.UpdateDepartmentById(this.editDepartmentData, this.editDepartmentData.id).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        
        if (response && response.success === false) {
          this.openErrorPopup(response.message || 'The server rejected validation changes to the department payload.');
          return;
        }

        // Successfully updated; refresh local cache states or reload live datasets grid lists
        this.loadDepartments();
        this.closeUpdateModal();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('An error exception dropped configuration changes:', err);
        const failureText = err?.error?.message || err?.message || 'A data synchronization layer failure aborted the department update operations.';
        this.openErrorPopup(failureText);
      }
    });
  }

  confirmDelete(): void {
    if (!this.departmentToDelete) return;

    const targetId = this.departmentToDelete.id;
    const targetName = this.departmentToDelete.name;

    this.closeDeleteConfirmation();

    this.departmentService.DeleteDepartmentById(targetId).subscribe({
      next: (response: any) => {
        if (response && response.success === false) {
          this.openErrorPopup(response.message || `Could not delete department "${targetName}".`);
          return;
        }
        console.log("Delete successful");
        this.departmentsList = this.departmentsList.filter(d => d.id !== targetId);
      },
      error: (err) => {
        console.error('Error executing department deletion request processing context:', err);
        const failureMessage = err?.error?.message || err?.message || 'A transmission exception occurred while deleting this department node.';
        this.openErrorPopup(failureMessage);
      }
    });
  }
}