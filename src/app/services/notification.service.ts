import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface Notification {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new Subject<Notification>();

  // Observable for components to subscribe
  public notifications$: Observable<Notification> =
    this.notificationsSubject.asObservable();

  // Send a new notification
  show(
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) {
    this.notificationsSubject.next({ message, type, timestamp: new Date() });
  }
}
