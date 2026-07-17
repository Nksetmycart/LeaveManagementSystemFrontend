import { Component } from '@angular/core';
import { Attendance } from "../../components/attendance/attendance";
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-my-attendance',
  imports: [Attendance],
  templateUrl: './my-attendance.html',
  styleUrl: './my-attendance.css',
})
export class MyAttendance {
  employeeId!: string;
  constructor(private authService: AuthService) {
    this.employeeId = this.authService.getEmployeeId()
  }
}
