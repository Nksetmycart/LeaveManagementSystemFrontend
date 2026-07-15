import { Component } from '@angular/core';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  userModel: any = {};
  constructor(private authService: AuthService) {
    this.userModel = this.authService.getUser();
  }

  getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length > 1) {
    // Returns first letters of first name and last name (e.g., "Liam Chen" -> "LC")
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  // Fallback for single names (takes first two letters)
  return name.substring(0, 2).toUpperCase();
}

}
