import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, UserResponse } from '../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginUserModel: any = {};

  constructor(private service: AuthService, private router: Router){}
  onSubmit() {
    this.service.loginUser(this.loginUserModel).subscribe({
      next: (response: UserResponse) => {
        console.log("Login Successful:", response)
         localStorage.setItem("token", response.data.token);

          localStorage.setItem(
            "user",
            JSON.stringify(response.data)
          );
        this.router.navigate([`dashboard`])
      },
      error: (err: any) => {
        console.log("Error Login User: ", err.message);
        alert("Failed to login User: " + err.message);
      }
    })
  }
}
