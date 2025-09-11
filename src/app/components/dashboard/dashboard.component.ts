// src/app/components/dashboard/dashboard.component.ts
import { Component, ViewChild, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { TelemetryService } from '../../services/TelemetryService'; // ✅ correct path
import type { Telemetry } from '../../services/TelemetryService';
import { Chart, ChartConfiguration } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
// ✅ Register datalabels plugin globally
Chart.register(ChartDataLabels);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnDestroy {
  subtitle = 'Live telemetry — Temperature & Humidity';

  private router = inject(Router);
  private telemetryService = inject(TelemetryService);

  // === Chart setup ===
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private maxPoints = 20;
  private timer?: number;
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
    scales: {
      x: { display: true },
      y: { beginAtZero: true },
    },
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
      tooltip: { enabled: true }, // still allow hover tooltips
    },
  };

  constructor() {
    // ✅ fetch latest readings on load
    this.loadRecentReadings();
    // Optional: refresh every 5 seconds
    this.timer = window.setInterval(() => this.loadRecentReadings(), 5000);
  }

  // === Logout ===
  logout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  // === Load readings from backend ===
  private loadRecentReadings(): void {
    this.telemetryService.getRecentReadings().subscribe({
      next: (data: Telemetry[]) => {
        this.readings = data
          .slice(-this.maxPoints) // last N readings
          .map((r) => ({
            temp: r.temperature,
            hum: r.humidity,
            label: new Date(r.timestamp).toLocaleTimeString(),
          }));
        this.updateCharts();
      },
      error: (err) => {
        console.error('Error fetching telemetry:', err);
      },
    });
  }

  // === Add manual/demo reading (optional) ===
  addReading(temp: number, hum: number): void {
    this.telemetryService.addReading(temp, hum).subscribe({
      next: (r: Telemetry) => {
        this.readings.push({
          temp: r.temperature,
          hum: r.humidity,
          label: new Date(r.timestamp).toLocaleTimeString(),
        });
        if (this.readings.length > this.maxPoints) this.readings.shift();
        this.updateCharts();
      },
      error: (err) => console.error('Error adding reading:', err),
    });
  }

  // === Chart update logic ===

  private updateCharts(): void {
    // Update line chart (works as before)
    this.lineChartData.labels = this.readings.map((r) => r.label);
    this.lineChartData.datasets[0].data = this.readings.map((r) => r.temp);

    // Update pie chart correctly
    const buckets = [0, 0, 0];
    for (const r of this.readings) {
      if (r.hum < 30) buckets[0]++;
      else if (r.hum <= 60) buckets[1]++;
      else buckets[2]++;
    }

    // ✅ Create a NEW dataset object instead of mutating the existing one
    this.pieChartData = {
      ...this.pieChartData,
      datasets: [
        {
          ...this.pieChartData.datasets[0],
          data: buckets,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'], // Dry=red, Comfort=blue, Humid=yellow
          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        },
      ],
    };

    // Force chart update
    this.chart?.update();
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
}
