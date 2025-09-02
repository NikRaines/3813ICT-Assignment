import { Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { UserService } from '../../services/user';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit{
  user!: User;

  constructor(private auth: Auth, private userService: UserService, private router: Router) {}
  deleteAccount() {
    if (!this.user?.username) return;
    this.userService.deleteUser(this.user.username).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.auth.logout();
          this.router.navigate(['/login']);
        }
      },
      error: () => {
        // Optionally handle error
      }
    });
  }

  ngOnInit(): void {
    let storedUser = this.auth.getCurrentUser();
    if (storedUser) {
      this.user = storedUser;
    }
    else {
      this.router.navigate(['/login']);
    }
  }
}
