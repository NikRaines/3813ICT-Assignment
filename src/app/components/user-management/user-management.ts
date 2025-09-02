import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss'
})
export class UserM {
  users: User[] = [];
  constructor(private userService: UserService) {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }
  
  approveUser(user: User) {
    this.userService.approveUser(user.username).subscribe({
      next: () => {
        user.valid = true;
      },
      error: () => {
        // Optionally show error message
      }
    });
  }
}
