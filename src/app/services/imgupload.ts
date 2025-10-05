import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ImguploadService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  imgupload(fd: FormData) {
    return this.http.post<any>(`${this.apiUrl}/api/upload`, fd);
  }
}
