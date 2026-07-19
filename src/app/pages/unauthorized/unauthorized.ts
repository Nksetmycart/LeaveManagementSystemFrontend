import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.css'
})
export class Unauthorized {

  constructor(private router: Router) {}

  /**
   * Safely redirects back to the main user environment page 
   */
  navigateToDashboard(): void {
    console.log("Redirecting user back into secure environment entry point root nodes...");
    this.router.navigate(['/dashboard']);
  }

  /**
   * Drops current invalid browser storage settings contexts and sweeps back to auth gates
   */
  logoutAndRedirect(): void {
    console.log("Flushing session layout tokens caches to re-initialize access authentication...");
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}