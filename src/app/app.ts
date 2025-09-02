import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from './services/auth';
import { User } from './models/user.model';
import { Login } from './components/login/login';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  user: any = null;
  protected readonly title = signal('chat');
  constructor(private router: Router, private auth: Auth) {
    this.user = this.auth.getCurrentUser();
    this.auth.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  logout() {
    this.auth.logout();
    this.user = null;
    this.router.navigate(['/login']);
  }
}
