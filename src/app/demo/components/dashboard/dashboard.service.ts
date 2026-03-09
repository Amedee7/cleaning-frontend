import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = 'http://localhost:8000/api/dashboard';
  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
