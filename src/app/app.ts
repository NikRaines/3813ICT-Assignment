import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from './services/auth';

import { Login } from './components/login/login';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('chat');
  constructor(private router: Router, private auth: Auth) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
