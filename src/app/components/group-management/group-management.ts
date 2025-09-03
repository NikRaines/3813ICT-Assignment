import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GroupService } from '../../services/group';
import { Group } from '../../models/group.model';
import { User } from '../../models/user.model';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-group-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './group-management.html',
  styleUrl: './group-management.scss'
})
export class GroupM {
  Groups: Group[] = [];
  selectedGroup: Group | null = null;
  selectedChannel: string | null = null;
  currentUser: User | null = null;

  constructor(private groupService: GroupService, private auth: Auth) {
  this.currentUser = this.auth.getCurrentUser();
    this.loadGroups();
  }


  loadGroups() {
    this.groupService.getGroups().subscribe(groups => {
      this.Groups = groups;
    });
  }

  selectGroup(group: Group) {
    this.selectedGroup = group;
    this.selectedChannel = null;
  }

  deleteGroup(group: Group) {
    this.groupService.deleteGroup(group.id).subscribe(() => {
      this.loadGroups();
      if (this.selectedGroup?.id === group.id) {
        this.selectedGroup = null;
        this.selectedChannel = null;
      }
    });
  }

  deleteChannel(group: Group, channel: string) {
    this.groupService.deleteChannel(group.id, channel).subscribe(() => {
      if (this.selectedGroup && this.selectedGroup.id === group.id) {
        this.selectedGroup.channels = this.selectedGroup.channels.filter(c => c !== channel);
        if (this.selectedChannel === channel) {
          this.selectedChannel = null;
        }
      }
      this.loadGroups();
    });
  }
}
