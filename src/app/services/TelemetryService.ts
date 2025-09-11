import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// DTO matching backend TelemetryDto
export interface Telemetry {
  temperature: number;
  humidity: number;
  timestamp: string; // ISO string from backend
}

@Injectable({
  providedIn: 'root',
})
export class TelemetryService {
  private baseUrl = 'http://localhost:8080/api/telemetry';

  constructor(private http: HttpClient) {}

  // ✅ Fetch last 20 readings
  getRecentReadings(): Observable<Telemetry[]> {
    return this.http.get<Telemetry[]>(`${this.baseUrl}/recent`);
  }

  // ✅ Add a new reading
  addReading(temp: number, hum: number): Observable<Telemetry> {
    return this.http.post<Telemetry>(`${this.baseUrl}/add`, {
      temperature: temp,
      humidity: hum,
    });
  }
}
