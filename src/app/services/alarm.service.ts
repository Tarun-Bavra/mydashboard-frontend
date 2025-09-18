// D:\userauth-system\frontend\src\app\services\AlarmService.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Frontend shape for an Alarm.
 * Keep this aligned with your backend Alarm DTO.
 */
export interface Alarm {
  id: number;
  deviceName: string;
  type: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  message: string; // added message field to show in notifications
  createdAt: string; // ISO timestamp
}

/** payload shape when creating a new alarm (adjust to match your backend DTO) */
export interface CreateAlarmRequest {
  deviceId: number | string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AlarmService {
  // Base API URL for alarms - matches backend /api/alarms
  private readonly baseUrl = 'http://localhost:8080/api/alarms';

  constructor(private http: HttpClient) {}

  /**
   * Fetch all alarms (or last N).
   * Returns an observable of Alarm array.
   */
  getAlarms(): Observable<Alarm[]> {
    return this.http.get<Alarm[]>(this.baseUrl);
  }

  /**
   * Create a new alarm.
   * POST /api/alarms
   * @param payload Alarm data to create
   */
  createAlarm(payload: CreateAlarmRequest): Observable<Alarm> {
    return this.http.post<Alarm>(this.baseUrl, payload);
  }

  /**
   * Acknowledge an alarm by ID.
   * PUT /api/alarms/{id}/ack
   * Returns the updated Alarm object.
   */
  acknowledgeAlarm(alarmId: number): Observable<Alarm> {
    return this.http.put<Alarm>(`${this.baseUrl}/${alarmId}/ack`, {});
  }

  /**
   * Resolve (close) an alarm by ID.
   * PUT /api/alarms/{id}/resolve
   * Returns the updated Alarm object.
   */
  resolveAlarm(alarmId: number): Observable<Alarm> {
    return this.http.put<Alarm>(`${this.baseUrl}/${alarmId}/resolve`, {});
  }
}
