import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group as GroupModel } from '../models/group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private apiUrl = 'http://localhost:3000';
  constructor(private http: HttpClient) {}

  getGroups(): Observable<GroupModel[]> {
    return this.http.get<GroupModel[]>(`${this.apiUrl}/api/groups`);
  }

  deleteGroup(groupId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/groups/${groupId}`);
  }

  deleteChannel(groupId: number, channel: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/groups/${groupId}/channels/${channel}`);
  }
  promoteAdmin(groupId: number, username: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/groups/${groupId}/promoteAdmin`, { username });
  }

  demoteAdmin(groupId: number, username: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/groups/${groupId}/demoteAdmin`, { username });
  }
}
