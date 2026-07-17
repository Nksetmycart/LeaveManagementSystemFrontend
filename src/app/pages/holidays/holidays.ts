import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HolidayService, HolidaysList } from '../../services/holiday-service';

export interface BackendHolidayRecord {
  id: string;
  name: string;
  type: string;
  date: Date;
}

@Component({
  selector: 'app-holidays',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './holidays.html',
  styleUrl: './holidays.css',
})
export class Holidays implements OnInit {
  
  holidayList: BackendHolidayRecord[] = [];
  apiResponse!: HolidaysList;

  constructor(private holidayService: HolidayService) {}

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

  deleteHoliday(holiday: BackendHolidayRecord): void {
    if (confirm(`Are you sure you want to delete the holiday rule allocation for "${holiday.name}"?`)) {
      // Local optimistic array filter cleanup fallback
      this.holidayList = this.holidayList.filter(h => h.id !== holiday.id);
    }
  }
}