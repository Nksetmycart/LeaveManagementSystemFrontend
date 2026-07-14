import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-departmens',
  imports: [CommonModule],
  templateUrl: './departmens.html',
  styleUrl: './departmens.css',
})
export class Departmens {
departments: Department[] = [
    { id: 1, name: 'Engineering', memberCount: 3 },
    { id: 2, name: 'Product', memberCount: 0 },
    { id: 3, name: 'Design', memberCount: 1 },
    { id: 4, name: 'People Ops', memberCount: 1 },
    { id: 5, name: 'Finance', memberCount: 0 }
  ];

  navigateToAddDepartment(): void {
    console.log('Opening management panel workflow blueprint to instantiate a new department...');
  }

  viewDepartmentDetails(dept: Department): void {
    console.log(`Loading metrics, structural tree overview, and member roster details for department: ${dept.name}`);
  }

  updateDepartment(dept: Department): void {
    console.log(`Launching inline administrative metadata modifier panel patch for: ${dept.name}`);
  }
}

interface Department {
  id: number;
  name: string;
  memberCount: number;
}