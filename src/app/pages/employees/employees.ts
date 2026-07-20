import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <-- Required for bidirectional select elements sync
import { EmployeeService, EmployeeResponseDto } from '../../services/employee-service';
import { AuthService, Role } from '../../services/auth-service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees implements OnInit {
  Role = Role;
  employeeList: EmployeeResponseDto[] = [];

  // Pagination Active Parameters Trackers
  page = 1;
  pageSize = 10;
  totalItems = 0;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  isLoading = false;

  // Popup Modal Operational State Tracking Metrics Variables
  showConfirmationModal = false;
  employeeToDelete: EmployeeResponseDto | null = null;

  constructor(
    public authService: AuthService,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  // FIXED: Accepts backup pagination tokens to safely execute fallbacks if 404 is encountered
  loadEmployees(backupPage: number = this.page, backupSize: number = this.pageSize): void {
    this.isLoading = true;
    
    this.employeeService.GetEmployees(this.page, this.pageSize).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.employeeList = response.data || [];
          
          // REINFORCED FALLBACK DETECTOR: Keeps navigation active even if meta summary values are missing
          if (response.totalCount !== undefined) {
            this.totalItems = response.totalCount;
          } else if (response.totalItems !== undefined) {
            this.totalItems = response.totalItems;
          } else {
            this.totalItems = this.employeeList.length < this.pageSize && this.page === 1 
              ? this.employeeList.length 
              : (this.page * this.pageSize) + 1;
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error("Error pulling database personnel matrix profiles:", error);
        
        // FIXED: Reverts the values at the frontend dashboard side upon interception of 404 states
        if (error?.status === 404) {
          console.warn(`Fetch aborted (404 Not Found). Reverting layout trackers to: Page ${backupPage}, Size ${backupSize}`);
          this.page = backupPage;
          this.pageSize = backupSize;
        }
      }
    });
  }

  onPageChange(newPage: number): void {
    if (newPage < 1 || (this.totalItems > 0 && newPage > this.totalPages)) return;
    const prevPage = this.page;
    this.page = newPage;
    this.loadEmployees(prevPage, this.pageSize);
  }

  onPageSizeChange(size: number): void {
    const prevSize = this.pageSize;
    const prevPage = this.page;
    this.pageSize = size;
    this.page = 1;
    this.loadEmployees(prevPage, prevSize);
  }

  // FIXED: Prevents evaluation loops locking layout on page 1 indefinitely
  get totalPages(): number {
    if (this.totalItems <= this.employeeList.length && this.page === 1) return 1;
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get startItemIndex(): number {
    if (this.employeeList.length === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get endItemIndex(): number {
    const computedEnd = this.page * this.pageSize;
    if (this.totalItems <= this.employeeList.length && this.page === 1) return this.employeeList.length;
    return computedEnd > this.totalItems ? this.totalItems : computedEnd;
  }

  getInitials(name: string): string {
    if (!name) return 'EE';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  updateEmployee(employee: EmployeeResponseDto): void {
    console.log('Opening administrative patch update matrix settings for:', employee.name);
    this.router.navigate(['/dashboard/employees/edit', employee.id]);
  }

  openDeleteConfirmation(employee: EmployeeResponseDto): void {
    this.employeeToDelete = employee;
    this.showConfirmationModal = true;
  }

  closeDeleteConfirmation(): void {
    this.showConfirmationModal = false;
    this.employeeToDelete = null;
  }

  confirmDelete(): void {
    if (!this.employeeToDelete) return;
    this.employeeService.DeleteEmployeeById(this.employeeToDelete.id).subscribe({
      next: () => {
        this.employeeList = this.employeeList.filter(e => e.id !== this.employeeToDelete!.id);
        this.closeDeleteConfirmation();
        this.loadEmployees();
      },
      error: (err) => {
        console.error("Failed executing delete parameters execution pipeline checks:", err);
        this.closeDeleteConfirmation();
      }
    });
  }
}