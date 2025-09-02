import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { Group } from '../../models/group.model';
import { User } from '../../models/user.model';
import { GroupService } from '../../services/group';
import { ChatService } from '../../services/chat';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  currentUser: User | null = null;
  userGroups: Group[] = [];
  selectedGroup: Group | null = null;
  selectedChannel: string | null = null;
  messages: any[] = [];

  constructor(private auth: Auth, private groupService: GroupService, private chatService: ChatService) {
    this.currentUser = this.auth.getCurrentUser();
    this.loadGroups();
  }

  loadGroups() {
    this.groupService.getGroups().subscribe(groups => {
      if (this.currentUser) {
        if (this.currentUser.role === 'SuperAdmin') {
          this.userGroups = groups;
        } else {
          this.userGroups = groups.filter(g => this.currentUser!.groups.includes(g.id));
        }
      }
    });
  }

  selectGroup(group: Group) {
    this.selectedGroup = group;
    this.selectedChannel = null;
  }

  sendMessage() {
  }

  selectChannel(channel: string) {
    this.selectedChannel = channel;
    if (this.selectedGroup) {
      this.loadMessages(this.selectedGroup.id, channel);
    }
  }

  loadMessages(groupId: number, channel: string) {
    if (!channel || !groupId) {
      this.messages = [];
      return;
    }
    this.chatService.getMessages(groupId, channel).subscribe(
      (msgs: any[]) => {
        this.messages = msgs;
      },
    );
  }
}
