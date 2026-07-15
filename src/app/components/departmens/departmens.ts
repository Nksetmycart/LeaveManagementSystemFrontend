import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { DepartmentService, GetDepartmentsList } from '../../services/department-service';

export interface Department {
  id: string; 
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-departmens',
  imports: [CommonModule, RouterLink],
  templateUrl: './departmens.html',
  styleUrl: './departmens.css',
})
export class Departmens implements OnInit {

  departmentsList: any[] = [];
  data!: GetDepartmentsList;

  constructor(private departmentService: DepartmentService) {}

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.departmentService.GetAllDepartments().subscribe({
      next: (response) => {
        this.data = response;
        this.departmentsList = response.data;
        console.log("Response: ", this.departmentsList);
      }, 
      error: (error) => {
        console.log("Error Fetching Departments List", error);
      }
    });
  }

  navigateToAddDepartment(): void {
    console.log('Opening management panel workflow blueprint to instantiate a new department...');
  }

  updateDepartment(dept: Department): void {
    console.log(`Launching inline administrative metadata modifier panel patch for: ${dept.name}`);
  }

  deleteDepartment(dept: Department): void {
    const isConfirmed = confirm(`Are you sure you want to delete the department "${dept.name}"?`);
    
    if (isConfirmed) {
      console.log(`Proceeding with deletion of department ID: ${dept.id}`);
      
      // Example call structure assuming you have a DeleteDepartment method exposed in your service:
      // this.departmentService.DeleteDepartment(dept.id).subscribe({
      //   next: () => {
      //     // Refresh your list locally on a successful backend response
      //     this.loadDepartments(); 
      //   },
      //   error: (err) => console.error('Error deleting department', err)
      // });
    }
  }
}