import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user';
import { Auth } from '../../services/auth';
import { User } from '../../models/user.model';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss'
})
export class UserM {
  users: User[] = [];
  notifications: Notification[] = [];
  currentUser: User | null = null;

  constructor(private userService: UserService, private auth: Auth) {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });

    this.userService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
    });

    this.currentUser = this.auth.getCurrentUser();
  }
    
  deleteNotification(notification: Notification) {
    if (confirm('Are you sure you want to delete this notification?')) {
      this.notifications = this.notifications.filter((n: Notification) => n.id !== notification.id);
    }
  }

  approveUser(user: User) {
    this.userService.approveUser(user.username).subscribe({
      next: () => {
        user.valid = true;
      },
    });
  }

  confirmDelete(user: User) {
    if (confirm(`Are you sure you want to delete user '${user.username}'?`)) {
      this.userService.deleteUser(user.username).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.username !== user.username);
        },
      });
    }
  }

    promoteToGroupAdmin(user: User) {
      this.userService.updateUserRoles(user.username, 'GroupAdmin').subscribe({
        next: () => {
          user.role = 'GroupAdmin';
        }
      });
    }

    demoteToUser(user: User) {
      this.userService.updateUserRoles(user.username, 'User').subscribe({
        next: () => {
          user.role = 'User';
        }
      });
    }

    promoteToSuperAdmin(user: User) {
      this.userService.updateUserRoles(user.username, 'SuperAdmin').subscribe({
        next: () => {
          user.role = 'SuperAdmin';
        }
      });
    }

    demoteToGroupAdmin(user: User) {
      this.userService.updateUserRoles(user.username, 'GroupAdmin').subscribe({
        next: () => {
          user.role = 'GroupAdmin';
        }
      });
    }
}
