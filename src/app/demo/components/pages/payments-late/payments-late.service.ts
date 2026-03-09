import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentsLateService {
  private apiUrl = 'http://localhost:3000/paiements';

  constructor(private http: HttpClient) {}

  getPaymentsLate(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/en-retard');
  }
}
