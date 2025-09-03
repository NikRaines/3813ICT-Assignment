import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { UserService } from '../../services/user';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  username = '';
  password = '';
  errorMessage = '';

  newUsername = '';
  newEmail = '';
  newPassword = '';
  registerMessage = '';
  registerError = '';

  constructor(private auth: Auth, private userService: UserService, private router: Router) {}

  //Login after approval
  login() {
    this.auth.login(this.username, this.password).subscribe({
      next: (response: User) => {
        if (response.valid !== false) {
          this.auth.saveProfile(response);
          this.router.navigate(['/profile']);
        } else {
          this.errorMessage = 'Invalid username or password';
        }
      },
      error: (err) => {
        if (err.status === 403) {
          this.errorMessage = 'Your account has not been approved yet.';
        } else {
          this.errorMessage = 'Invalid username or password';
        }
      }
    });
  }

  //Register an account
  register() {
    this.registerMessage = '';
    this.registerError = '';
    if (!this.newUsername || !this.newEmail || !this.newPassword) {
      this.registerError = 'Please enter a username, email, and password.';
      return;
    }
    this.userService.register(this.newUsername, this.newEmail, this.newPassword).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.registerMessage = 'Account created successfully! Please wait for approval.';
          this.newUsername = '';
          this.newEmail = '';
          this.newPassword = '';
        } else {
          this.registerError = response.message || 'Registration failed.';
        }
      },
      error: (err: any) => {
        this.registerError = err.error?.message || 'Registration failed.';
      }
    });
  }

}
