import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HolidayService, HolidaysList } from '../../services/holiday-service';
import { AuthService, Role } from '../../services/auth-service';

export interface BackendHolidayRecord {
  id: string;
  name: string;
  type: string;
  date: Date;
}

export interface UpdateHolidayDto {
  name: string;
  type: string;
  date: string; // Dynamic ISO String payload requirement pattern format matching updateDto
}

@Component({
  selector: 'app-holidays',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './holidays.html',
  styleUrl: './holidays.css',
})
export class Holidays implements OnInit {
  Role = Role;

  holidayList: BackendHolidayRecord[] = [];
  apiResponse!: HolidaysList;

  // Confirmation Modal Operational States
  showConfirmationModal = false;
  holidayToDelete: BackendHolidayRecord | null = null;

  // Update Form Card Popup States
  showUpdateModal = false;
  editHolidayData: { id: string; name: string; type: string; date: string } | null = null;
  isSubmitting = false;

  // Error Popup Modal Operational States
  showErrorModal = false;
  apiErrorMessage = '';

  constructor(private holidayService: HolidayService, public authService: AuthService) {}

  ngOnInit(): void {
    this.loadAllHolidays();
  }

  loadAllHolidays(): void {
    this.holidayService.GetHolidays().subscribe({
      next: (response) => {
        this.apiResponse = response;
        this.holidayList = response.data;
      },
      error: (error) => {
        console.error("Error retrieving holiday entries array list stream:", error);
      }
    });
  }

  // --- POPUP ACTION MODAL CONTROLLERS ---
  openDeleteConfirmation(holiday: BackendHolidayRecord): void {
    this.holidayToDelete = holiday;
    this.showConfirmationModal = true;
  }

  closeDeleteConfirmation(): void {
    this.showConfirmationModal = false;
    this.holidayToDelete = null;
  }

  openUpdateModal(holiday: BackendHolidayRecord): void {
    // Correctly parses standard JavaScript Date formats or ISO string arrays into local HTML date string configurations (YYYY-MM-DD)
    let formattedDateString = '';
    if (holiday.date) {
      const d = new Date(holiday.date);
      if (!isNaN(d.getTime())) {
        formattedDateString = d.toISOString().split('T')[0];
      }
    }

    this.editHolidayData = {
      id: holiday.id,
      name: holiday.name,
      type: holiday.type,
      date: formattedDateString
    };
    this.showUpdateModal = true;
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.editHolidayData = null;
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
    if (form.invalid || !this.editHolidayData) return;

    this.isSubmitting = true;
    const targetId = this.editHolidayData.id;

    // Build the payload payload structural format object matching specifications parameters
    const payloadDateObj = new Date(this.editHolidayData.date);
    const payload: UpdateHolidayDto = {
      name: this.editHolidayData.name,
      type: this.editHolidayData.type,
      date: payloadDateObj.toISOString() // Formats back to standard "2026-07-17T19:51:25.514Z" matching updateDto requirement rules
    };

    // Assumes backend pipeline endpoint mirrors standard mapping signature: UpdateHoliday(id, payload)
    this.holidayService.UpdateHolidayById(targetId, payload).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        
        if (response && response.success === false) {
          this.openErrorPopup(response.message || 'The calendar data tier endpoint rejected modifications parameters.');
          return;
        }

        this.loadAllHolidays();
        this.closeUpdateModal();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error("Failed to commit calendar update transactions:", err);
        const failureText = err?.error?.message || err?.message || 'A data synchronization layer failure aborted holiday updates modifications operations.';
        this.openErrorPopup(failureText);
      }
    });
  }

  confirmDelete(): void {
    if (!this.holidayToDelete) return;

    const targetId = this.holidayToDelete.id;
    const targetName = this.holidayToDelete.name;

    this.closeDeleteConfirmation();

    // Assumes backend service layout uses structural standard method: DeleteHolidayById(id)
    this.holidayService.DeleteHolidayById(targetId).subscribe({
      next: (response: any) => {
        if (response && response.success === false) {
          this.openErrorPopup(response.message || `Could not drop holiday configuration assignment layer rules for "${targetName}".`);
          return;
        }
        
        console.log("Delete transaction sequence executed cleanly.");
        this.holidayList = this.holidayList.filter(h => h.id !== targetId);
      },
      error: (err) => {
        console.error("Could not drop data record row:", err);
        const failureMessage = err?.error?.message || err?.message || 'A transaction drop execution barrier exception derailed the removal processing configuration context rules.';
        this.openErrorPopup(failureMessage);
      }
    });
  }
}