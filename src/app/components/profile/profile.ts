import { Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit{
  user!: User;

  constructor(private auth: Auth, private router: Router) {}

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
