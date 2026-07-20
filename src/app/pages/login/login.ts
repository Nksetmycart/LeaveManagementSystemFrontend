import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
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

  // Notification Banner State Properties
  notification = {
    show: false,
    message: ''
  };

  constructor(private service: AuthService, private router: Router){}

  onSubmit(form: NgForm) {
    if (form.invalid) {
      this.triggerToastNotification("Login aborted: Form fields constraints are currently invalid.");
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
        console.error("Error Login User: ", err, this.loginUserModel);
        
        // Dynamic fallback extracts backend response message or message array property cleanly
        const backendMessage = err?.error?.message || err?.error || err?.message || "An unexpected error occurred.";
        this.triggerToastNotification(backendMessage);
      }
    });
  }

  triggerToastNotification(msg: string): void {
    this.notification = { show: true, message: msg };
    setTimeout(() => { this.dismissNotification(); }, 5000);
  }

  dismissNotification(): void {
    this.notification.show = false;
  }
}