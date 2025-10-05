import { Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { UserService } from '../../services/user';
import { User } from '../../models/user.model';
import { ImguploadService } from '../../services/imgupload';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit{
  user!: User;
  title = 'app';
  selectedfile: any = null;
  imagepath = "";

  constructor(private auth: Auth, private userService: UserService, private router: Router, private imgUploadService: ImguploadService) {}

  ngOnInit(): void {
    let storedUser = this.auth.getCurrentUser();
    if (storedUser) {
      this.user = storedUser;
    }
    else {
      this.router.navigate(['/login']);
    }
  }

  onFileSelected(event: any){
    console.log(event)
    this.selectedfile = event.target.files[0];
  }

  onUpload(){
    const fd = new FormData();
    fd.append('image', this.selectedfile!, this.selectedfile!.name);
    this.imgUploadService.imgupload(fd).subscribe(res=>{
      this.imagepath = res.data.filename;
      
      // Save the image path to the user's profile in the database
      this.userService.updateProfileImg(this.user.username, this.imagepath).subscribe({
        next: (response) => {
          if (response.success) {
            this.user.profileImg = this.imagepath;
            this.auth.saveProfile(this.user);
          }
        }
      });
    });
  }

  //User deletes account
  deleteAccount() {
    if (!this.user?.username) return;
    this.userService.deleteUser(this.user.username).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.auth.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }
}
