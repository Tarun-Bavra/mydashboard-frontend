// src/app/models/alarm.ts

/**
 * Alarm shape on the frontend — mirror this to your backend AlarmDto.
 */
export interface Alarm {
  id: number;
  deviceId?: string; // device identifier that raised the alarm (optional)
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'WARNING' | 'INFO' | string;
  message: string; // human-friendly description
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'CLEARED' | string;
  createdAt: string; // ISO timestamp, e.g. "2025-09-15T12:34:56"
  acknowledgedAt?: string | null;
  clearedAt?: string | null;
}

/**
 * Payload used when creating a new alarm from the UI (POST body).
 */
export interface CreateAlarmRequest {
  deviceId: string;
  severity: string;
  message: string;
}
