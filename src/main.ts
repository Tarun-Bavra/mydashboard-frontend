// src/main.ts (only the providers portion shown)
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(), // <-- ensures HttpClient is available app-wide
    provideCharts(withDefaultRegisterables()), // if you already included charts
  ],
}).catch((err) => console.error(err));
