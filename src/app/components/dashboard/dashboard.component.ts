// src/app/components/dashboard/dashboard.component.ts
import { Component, ViewChild, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { TelemetryService } from '../../services/TelemetryService';
import type { Telemetry } from '../../services/TelemetryService';
import { Chart, ChartConfiguration } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { AlarmService, Alarm } from '../../services/alarm.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationToastComponent } from '../notification-toast/notification-toast.component';
import { interval, Subscription } from 'rxjs';
import { AlarmListComponent } from '../alarm/alarm-list.component';
import { AlarmCreateComponent } from '../alarm/alarm-create.component';

Chart.register(ChartDataLabels);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
    NotificationToastComponent,
    AlarmListComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnDestroy {
  subtitle = 'Live telemetry — Temperature & Humidity';

  private alarmService = inject(AlarmService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private telemetryService = inject(TelemetryService);

  private knownAlarmIds = new Set<number>();
  private telemetryTimer?: number;
  private alarmPollSub?: Subscription;

  private readonly POLL_INTERVAL = 5000; // ms
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  private maxPoints = 20;
  private readings: { temp: number; hum: number; label: string }[] = [];

  // Temperature line chart
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Temperature (°C)',
        data: [],
        borderWidth: 2,
        tension: 0.35,
        fill: false,
        pointRadius: 3,
      },
    ],
  };
  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: { x: { display: true }, y: { beginAtZero: true } },
  };

  // Humidity pie chart
  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Dry (<30%)', 'Comfort (30-60%)', 'Humid (>60%)'],
    datasets: [{ label: 'Humidity', data: [0, 0, 0] }],
  };
  public pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      datalabels: {
        color: '#fff',
        formatter: (value: number, ctx: any) => {
          const sum = ctx.chart.data.datasets[0].data.reduce(
            (a: number, b: number) => a + b,
            0
          );
          return sum > 0 ? Math.round((value / sum) * 100) + '%' : '';
        },
        font: { weight: 'bold', size: 14 },
      },
      tooltip: { enabled: true },
    },
  };

  constructor() {
    // Start telemetry polling
    this.loadRecentReadings();
    this.telemetryTimer = window.setInterval(
      () => this.loadRecentReadings(),
      this.POLL_INTERVAL
    );

    // Start alarm polling
    this.fetchActiveAlarms();
    this.alarmPollSub = interval(this.POLL_INTERVAL).subscribe(() =>
      this.fetchActiveAlarms()
    );
  }

  // Fetch active alarms from backend and show notifications
  private fetchActiveAlarms(): void {
    this.alarmService.getAlarms().subscribe({
      next: (alarms: Alarm[]) => {
        alarms.forEach((alarm) => {
          if (!this.knownAlarmIds.has(alarm.id)) {
            this.notificationService.show(
              `New Alarm: ${alarm.severity} - ${alarm.message}`,
              'warning'
            );
            this.knownAlarmIds.add(alarm.id);
          }
        });
      },
      error: (err) => console.error('Error fetching alarms:', err),
    });
  }

  // Logout user and redirect
  logout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  // Navigate to alarms page
  goToAlarms(): void {
    this.router.navigate(['/alarms']);
  }
  goToCreateAlarm(): void {
    this.router.navigate(['/alarms/create']);
  }
  // Load last N telemetry readings
  private loadRecentReadings(): void {
    this.telemetryService.getRecentReadings().subscribe({
      next: (data: Telemetry[]) => {
        this.readings = data.slice(-this.maxPoints).map((r) => ({
          temp: r.temperature,
          hum: r.humidity,
          label: new Date(r.timestamp).toLocaleTimeString(),
        }));
        this.updateCharts();
      },
      error: (err) => console.error('Error fetching telemetry:', err),
    });
  }

  // Update line & pie charts
  private updateCharts(): void {
    // Line chart
    this.lineChartData = {
      ...this.lineChartData,
      labels: this.readings.map((r) => r.label),
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data: this.readings.map((r) => r.temp),
        },
      ],
    };

    // Pie chart
    const buckets = [0, 0, 0];
    this.readings.forEach((r) => {
      if (r.hum < 30) buckets[0]++;
      else if (r.hum <= 60) buckets[1]++;
      else buckets[2]++;
    });
    this.pieChartData = {
      ...this.pieChartData,
      datasets: [
        {
          ...this.pieChartData.datasets[0],
          data: buckets,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        },
      ],
    };

    this.chart?.update();
  }

  ngOnDestroy(): void {
    if (this.telemetryTimer) clearInterval(this.telemetryTimer);
    this.alarmPollSub?.unsubscribe();
  }
}
