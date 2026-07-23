import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RenewalService {
  private baseUrl = 'https://localhost:7241/api/v0';

  constructor(private http: HttpClient) { }

  RenewLeaveBalances(): Observable<Response> {
    return this.http.post<Response>(`${this.baseUrl}/LeaveBalance/renew-monthly-balance`, null)
  }

  checkMonthlyRenewal(): void {

    const today = new Date();
    if (today.getDate() !== 1){
      console.log("Date is not 1st of the month.")
      return;
    }

    const lastRenewal = localStorage.getItem('lastRenewalDate')
    const todayString = today.toISOString().split('T')[0];

    if (lastRenewal == todayString) {
      return;
    }

    this.RenewLeaveBalances().subscribe({
      next: () => {
        console.log('Leave balances renewed successfully.')
        localStorage.setItem('lastRenewalDate', todayString)
      },
      error: err => {
        console.error(err);
      }
    })
  }
}
