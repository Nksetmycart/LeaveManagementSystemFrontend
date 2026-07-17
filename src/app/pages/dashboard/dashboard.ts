import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Navbar } from '../../components/navbar/navbar';
import { Calandar } from '../../components/calandar/calandar';

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar, Navbar, RouterOutlet, Calandar, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
isModalOpen = false;

  toggleModal(isOpen: boolean): void {
    this.isModalOpen = isOpen;
  }
}
