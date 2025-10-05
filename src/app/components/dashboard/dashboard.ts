import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { Group } from '../../models/group.model';
import { User } from '../../models/user.model';
import { GroupService } from '../../services/group';
import { ChatService } from '../../services/chat';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, OnDestroy {
  currentUser: User | null = null;
  userGroups: Group[] = [];
  selectedGroup: Group | null = null;
  selectedChannel: string | null = null;
  messages: any[] = [];
  chatInput: string = '';
  private messageSubscription: Subscription = new Subscription();

  constructor(private auth: Auth, private groupService: GroupService, private chatService: ChatService) {
    this.currentUser = this.auth.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadGroups();
    this.chatService.initSocket();
    
    this.messageSubscription = this.chatService.onMessage().subscribe((message: any) => {
      this.messages.push(message);
    });
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
    this.chatService.disconnect();
  }

  //Loading groups for current user
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

  //Selecting a group
  selectGroup(group: Group) {
    if (this.selectedGroup && this.selectedChannel) {
      this.chatService.leaveRoom(this.selectedGroup.id, this.selectedChannel, this.currentUser!.username);
    }
    
    this.selectedGroup = group;
    this.selectedChannel = null;
    this.messages = [];
  }

  //Selecting a channel
  selectChannel(channel: string) {
    if (this.selectedGroup && this.selectedChannel) {
      this.chatService.leaveRoom(this.selectedGroup.id, this.selectedChannel, this.currentUser!.username);
    }

    this.selectedChannel = channel;
    if (this.selectedGroup) {
      this.loadMessages(this.selectedGroup.id, channel);
      this.chatService.joinRoom(this.selectedGroup.id, channel, this.currentUser!.username);
    }
  }

  //Sending a message
  sendMessage() {
    if (!this.chatInput.trim()) return;
    const newMsg = {
      sender: this.currentUser!.username,
      text: this.chatInput,
      groupId: this.selectedGroup!.id,
      channel: this.selectedChannel!,
    };
    
    this.chatService.sendMessage(newMsg);
    this.chatInput = '';
  }

  //Loading old messages for a specific channel
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
