// src/app/components/alarm/alarm-list.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { startWith, switchMap, shareReplay } from 'rxjs/operators';
import { AlarmService, Alarm } from '../../services/alarm.service';

@Component({
  selector: 'app-alarm-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alarm-list.component.html',
  styleUrls: ['./alarm-list.component.css'],
})
export class AlarmListComponent {
  private router = inject(Router);
  private alarmService = inject(AlarmService);

  // Stream to trigger reloads
  private refresh$ = new Subject<void>();

  /**
   * alarms$ is an observable stream of alarms
   * - startWith triggers initial fetch
   * - switchMap cancels old request if refresh fired
   * - shareReplay caches last value
   */
  public alarms$: Observable<Alarm[]> = this.refresh$.pipe(
    startWith(void 0),
    switchMap(() => this.alarmService.getAlarms()),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  refresh(): void {
    this.refresh$.next();
  }

  acknowledge(alarm: Alarm): void {
    this.alarmService.acknowledgeAlarm(alarm.id).subscribe({
      next: () => this.refresh(),
      error: (err) => console.error('Failed to acknowledge alarm', err),
    });
  }

  resolve(alarm: Alarm): void {
    this.alarmService.resolveAlarm(alarm.id).subscribe({
      next: () => this.refresh(),
      error: (err) => console.error('Failed to resolve alarm', err),
    });
  }

  goCreateAlarm(): void {
    this.router.navigate(['/alarms/create']);
  }
}
