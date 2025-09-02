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
}
