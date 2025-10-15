import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private backendUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.backendUrl}/stats`);
  }

  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/employees`);
  }

  getSuccessfulSmsLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/sms_logs/success`);
  }

  getFailedSmsLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/sms_logs/failed`);
  }

  getSettings(): Observable<any> {
    return this.http.get<any>(`${this.backendUrl}/settings`);
  }

  saveSettings(settings: any): Observable<any> {
    return this.http.put<any>(`${this.backendUrl}/settings`, settings);
  }

}
