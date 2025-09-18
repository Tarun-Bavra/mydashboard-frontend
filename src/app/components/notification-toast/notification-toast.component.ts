import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NotificationService,
  Notification,
} from '../../services/notification.service';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-toast.component.html',
  styleUrls: ['./notification-toast.component.css'],
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private sub?: Subscription;

  notifications: Notification[] = [];

  ngOnInit(): void {
    // Subscribe to notifications
    this.sub = this.notificationService.notifications$.subscribe((notif) => {
      this.notifications.push(notif);

      // Auto-remove after 5 seconds
      timer(5000).subscribe(() => {
        this.notifications = this.notifications.filter((n) => n !== notif);
      });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
