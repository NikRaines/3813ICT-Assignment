import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
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

  constructor(private auth: Auth, private router: Router) {}

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
      error: () => {
        this.errorMessage = 'Invalid username or password';
      }
    });
  }

}
