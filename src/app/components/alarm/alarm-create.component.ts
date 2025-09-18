// src/app/components/alarm/alarm-create.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AlarmService, CreateAlarmRequest } from '../../services/alarm.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-alarm-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './alarm-create.component.html',
  styleUrls: ['./alarm-create.component.css'],
})
export class AlarmCreateComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private alarmService = inject(AlarmService);
  private notificationService = inject(NotificationService);

  alarmForm: FormGroup;

  constructor() {
    // Initialize reactive form with validation
    this.alarmForm = this.fb.group({
      deviceId: ['', Validators.required],
      severity: ['CRITICAL', Validators.required],
      message: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  // Submit the alarm form
  createAlarm(): void {
    if (this.alarmForm.invalid) {
      this.alarmForm.markAllAsTouched();
      return;
    }

    const payload: CreateAlarmRequest = this.alarmForm.value;

    this.alarmService.createAlarm(payload).subscribe({
      next: (alarm) => {
        this.notificationService.show(
          `Alarm created successfully: ${alarm.severity} - ${alarm.message}`,
          'success'
        );
        // Navigate back to alarms list
        this.router.navigate(['/alarms']);
      },
      error: (err) => {
        console.error('Error creating alarm:', err);
        this.notificationService.show(
          'Failed to create alarm. Try again.',
          'error'
        );
      },
    });
  }
}
