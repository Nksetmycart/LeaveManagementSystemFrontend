import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Navbar } from "../navbar/navbar";
import { RouterOutlet } from '@angular/router';
import { Calandar } from '../calandar/calandar';
import { CommonModule } from '@angular/common';

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
