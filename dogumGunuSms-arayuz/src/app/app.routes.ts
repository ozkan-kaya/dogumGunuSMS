import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'employees',
    loadComponent: () => import('./pages/employees/employees').then(m => m.Employees)
  },
  {
    path: 'sms-logs/success',
    loadComponent: () => import('./pages/sms-logs-success/sms-logs-success').then(m => m.SmsLogsSuccess)
  },
  {
    path: 'sms-logs/failed',
    loadComponent: () => import('./pages/sms-logs-failed/sms-logs-failed').then(m => m.SmsLogsFailed)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then(m => m.Settings)
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  },
];
