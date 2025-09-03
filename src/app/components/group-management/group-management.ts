import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GroupService } from '../../services/group';
import { Group } from '../../models/group.model';
import { User } from '../../models/user.model';
import { Auth } from '../../services/auth';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-group-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './group-management.html',
  styleUrl: './group-management.scss'
})
export class GroupM {
  groupUsers: User[] = [];
  appliedUsers: User[] = [];
  Groups: Group[] = [];
  selectedGroup: Group | null = null;
  selectedChannel: string | null = null;
  currentUser: User | null = null;
  newGroupName: string = '';
  newChannelName: string = '';
  
  createGroup() {
    if (!this.newGroupName.trim() || !this.currentUser) return;
    this.groupService.createGroup(this.newGroupName.trim(), this.currentUser.username, this.currentUser.role).subscribe((res) => {
      this.newGroupName = '';
      if (this.currentUser && this.currentUser.role === 'GroupAdmin' && res.group && res.group.id) {
        this.currentUser.groups.push(res.group.id);
      }
      this.loadGroups();
    });
  }

  createChannel() {
    if (!this.selectedGroup || !this.newChannelName.trim() || !this.currentUser) return;
    this.groupService.createChannel(this.selectedGroup.id, this.newChannelName.trim(), this.currentUser.username, this.currentUser.role).subscribe((res) => {
      this.newChannelName = '';
      this.groupService.getGroups().subscribe(groups => {
        const updatedGroup = groups.find(g => g.id === this.selectedGroup!.id);
        if (updatedGroup) {
          this.selectGroup(updatedGroup);
        } else {
          this.loadGroups();
        }
      });
    });
  }

  constructor(private groupService: GroupService, private auth: Auth, private userService: UserService) {
    const localUser = this.auth.getCurrentUser();
    this.userService.getUsers().subscribe((users: User[]) => {
      this.currentUser = users.find(u => u.username === localUser?.username) || localUser || null;
      this.loadGroups();
    });
  }

  promoteToGroupAdmin(user: User) {
    if (!this.selectedGroup) return;
    this.groupService.promoteAdmin(this.selectedGroup.id, user.username).subscribe(() => {
      if (!this.selectedGroup!.admins.includes(user.username)) {
        this.selectedGroup!.admins.push(user.username);
      }
    });
  }

  demoteToUser(user: User) {
    if (!this.selectedGroup) return;
    this.groupService.demoteAdmin(this.selectedGroup.id, user.username).subscribe(() => {
      this.selectedGroup!.admins = this.selectedGroup!.admins.filter(admin => admin !== user.username);
    });
  }


  loadGroups() {
    this.groupService.getGroups().subscribe(groups => {
      this.Groups = groups;
    });
  }

  selectGroup(group: Group) {
    this.selectedGroup = group;
    this.selectedChannel = null;
    this.userService.getUsers().subscribe((users: User[]) => {
      this.groupUsers = users.filter((u: User) => (u.groups.includes(group.id)) || u.role === 'SuperAdmin');
      this.appliedUsers = users.filter((u: User) => u.appliedGroups.includes(group.id));
    });
  }

  deleteGroup(group: Group) {
    if (confirm(`Are you sure you want to delete the group '${group.name}'? This will remove all channels and messages in this group.`)) {
      this.groupService.deleteGroup(group.id).subscribe(() => {
        this.loadGroups();
        if (this.selectedGroup?.id === group.id) {
          this.selectedGroup = null;
          this.selectedChannel = null;
        }
      });
    }
  }

  leaveGroup(group: Group) {
    if (!this.currentUser) { return; }
    if (confirm(`Are you sure you want to leave the group '${group.name}'?`)) {
      const updatedGroups = this.currentUser.groups.filter((gid: number) => gid !== group.id);
      this.userService.updateUserGroups(this.currentUser.username, updatedGroups).subscribe(() => {
        this.currentUser = { ...this.currentUser!, groups: updatedGroups };
        this.loadGroups();
        if (this.selectedGroup?.id === group.id) {
          this.selectedGroup = null;
          this.selectedChannel = null;
        }
      });
    }
  }
  deleteChannel(group: Group, channel: string) {
    if (confirm(`Are you sure you want to delete the channel '${channel}' from group '${group.name}'? This will remove all messages in this channel.`)) {
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

  removeUserFromGroup(user: User, group: Group) {
    if (confirm(`Are you sure you want to remove ${user.username} from ${group.name}?`)) {
      const updatedGroups = user.groups.filter(gid => gid !== group.id);
      this.userService.updateUserGroups(user.username, updatedGroups).subscribe(() => {
        this.selectGroup(group);
      });
    }
  }

  applyToGroup(group: Group) {
    if (!this.currentUser) return;
    const updatedAppliedGroups = [...this.currentUser.appliedGroups, group.id];
    this.userService.updateUserAppliedGroups(this.currentUser.username, updatedAppliedGroups).subscribe(() => {
      this.userService.getUsers().subscribe((users: User[]) => {
        const updatedUser = users.find(u => u.username === this.currentUser!.username);
        if (updatedUser) {
          this.currentUser = updatedUser;
        }
        this.loadGroups();
      });
    })
  }

  approveUser(user: User, group: Group) {
    const updatedAppliedGroups = user.appliedGroups.filter(gid => gid !== group.id);
    const updatedGroups = [...user.groups, group.id];
    this.userService.updateUserAppliedGroups(user.username, updatedAppliedGroups).subscribe(() => {
      this.userService.updateUserGroups(user.username, updatedGroups).subscribe(() => {
        this.selectGroup(group);
      });
    });
  }
}
