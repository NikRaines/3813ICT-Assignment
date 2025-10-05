import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:3000';
  private socket!: Socket;

  constructor(private http: HttpClient) {}

  //Initialize socket connection
  initSocket(): void {
    this.socket = io(this.apiUrl);
  }

  //Load chat history
  getMessages(groupId: number, channel: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/messages?groupId=${groupId}&channel=${channel}`);
  }

  //Listen for new messages
  onMessage(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('message', (data: any) => {
        observer.next(data);
      });
    });
  }

  //Sending new messages
  sendMessage(message: any): void {
    this.socket.emit('sendMessage', message);
  }

  //Joining a chat room
  joinRoom(groupId: number, channel: string, username: string): void {
    this.socket.emit('joinRoom', { groupId, channel, username });
  }

  //Leaving a chat room
  leaveRoom(groupId: number, channel: string, username: string): void {
    this.socket.emit('leaveRoom', { groupId, channel, username });
  }

  //Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
