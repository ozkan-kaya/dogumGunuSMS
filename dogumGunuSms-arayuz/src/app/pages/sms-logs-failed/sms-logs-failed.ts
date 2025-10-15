import { Component, OnInit } from '@angular/core';
import { Api } from '../../services/api';

import { PageHeader } from '../../components/page-header/page-header';
import { DataTable, TableColumn } from '../../components/data-table/data-table';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-sms-logs-failed',
  standalone: true,
  imports: [
    PageHeader,
    DataTable
  ],
  templateUrl: './sms-logs-failed.html',
  styleUrls: ['./sms-logs-failed.css']
})
export class SmsLogsFailed implements OnInit {
  failedLogs: any[] = [];
  isLoading = true;

  failedLogColumns: TableColumn[] = [
    { key: 'id', label: '#' },
    { key: 'employee_name', label: 'Personel', icon: 'fas fa-user' },
    { key: 'phone_number', label: 'Telefon', icon: 'fas fa-phone' },
    { key: 'error_id', label: 'Hata Kodu', icon: 'fas fa-hashtag' },
    { key: 'error_message', label: 'Hata Mesajı', icon: 'fas fa-comment-dots' },
    { key: 'sent_at', label: 'Deneme Tarihi', icon: 'fas fa-clock', isDate: true }
  ];

  constructor(private apiService: Api, private titleService: Title) { }

  ngOnInit(): void {
    this.apiService.getFailedSmsLogs().subscribe(data => {
      this.failedLogs = data;
      this.isLoading = false;
    });
    this.titleService.setTitle('Doğum Günü SMS - Başarısız SMS');
  }
}
