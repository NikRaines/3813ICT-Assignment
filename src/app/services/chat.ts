import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:3000';
  constructor(private http: HttpClient) {}

  //Messages
  getMessages(groupId: number, channel: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/api/messages?groupId=${groupId}&channel=${channel}`);
  }

  //Sending message
  sendMessage(message: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/messages`, message);
  }
}
