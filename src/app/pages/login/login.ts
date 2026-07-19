import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'; // <-- Added NgForm import here
import { AuthService, UserResponse } from '../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginUserModel: any = {};

  constructor(private service: AuthService, private router: Router){}

  // UPDATED: Now accepts form instance validation profiles parameters
  onSubmit(form: NgForm) {
    // HARD GUARD: Blocks pipeline execution completely if required fields are missing/invalid
    if (form.invalid) {
      console.log("Login aborted: Forms constraints are currently invalid.");
      return;
    }

    this.service.loginUser(this.loginUserModel).subscribe({
      next: (response: UserResponse) => {
        console.log("Login Successful:", response);
        localStorage.setItem("token", response.data.token);

        localStorage.setItem(
          "user",
          JSON.stringify(response.data)
        );
        
        this.router.navigate([`dashboard`]);
      },
      error: (err: any) => {
        console.log("Error Login User: ", err.message, this.loginUserModel);
        alert("Failed to login User: " + err.message);
      }
    });
  }
}