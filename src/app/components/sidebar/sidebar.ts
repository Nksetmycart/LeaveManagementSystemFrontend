import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, Role } from '../../services/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  Role = Role;
  
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  onSignOut(event: Event): void {
    event.preventDefault();

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    console.log('Authentication parameters purged: User signed out successfully.');

    this.router.navigate(['/login']);
  }
}