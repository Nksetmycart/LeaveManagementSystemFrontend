import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Structural replica mapping your C# CreateHolidayDto class exactly
export interface CreateHolidayDto {
  name: string;
  type: string;
  date: string; // Transmitted as an ISO date string format
}

export interface HolidayResponse {
  success: boolean;
  message: string;
  data?: any;
}

export class HolidaysList {
  data!: Array<{
    id: string;
    name: string;
    type: string;
    date: Date;
  }>;
  message!: string;
  success!: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HolidayService {
  private apiUrl = 'https://localhost:7241/api/v0/Holiday';

  constructor(private http: HttpClient) { }

  CreateHoliday(data: CreateHolidayDto): Observable<HolidayResponse> {
    console.log("Submitting Holiday Payload:", data);
    return this.http.post<HolidayResponse>(this.apiUrl, data);
  }

  GetHolidays(): Observable<HolidaysList> {
    return this.http.get<HolidaysList>(this.apiUrl);
  }
}