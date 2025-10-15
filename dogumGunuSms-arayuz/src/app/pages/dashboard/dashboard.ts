import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatsCard } from '../../components/stats-card/stats-card';
import { Api } from '../../services/api';
import { PageHeader } from '../../components/page-header/page-header';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, StatsCard, PageHeader, PageHeader],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
  stats: any = {
    total_employees: 0,
    success_sms: 0,
    failed_sms: 0,
  };
  isLoading: boolean = true;
  hasError: boolean = false;

  constructor(private apiService: Api, private titleService: Title) { }

  ngOnInit(): void {
    this.apiService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
        this.hasError = false;
      },
      error: (err) => {
        console.error('İstatistikler yüklenirken hata oluştu:', err);
        this.isLoading = false;
        this.hasError = true;
      }
    })
    this.titleService.setTitle('Doğum Günü SMS');
  }
}
