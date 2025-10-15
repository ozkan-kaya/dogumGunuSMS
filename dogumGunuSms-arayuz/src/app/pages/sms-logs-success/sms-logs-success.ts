import { Component, OnInit } from '@angular/core';
import { Api } from '../../services/api';

import { PageHeader } from '../../components/page-header/page-header';
import { DataTable, TableColumn } from '../../components/data-table/data-table';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-sms-logs-success',
  standalone: true,
  imports: [
    PageHeader,
    DataTable
  ],
  templateUrl: './sms-logs-success.html',
  styleUrls: ['./sms-logs-success.css']
})
export class SmsLogsSuccess implements OnInit {
  successfulLogs: any[] = [];
  isLoading = true;

  successLogColumns: TableColumn[] = [
    { key: 'id', label: '#' },
    { key: 'employee_name', label: 'Personel', icon: 'fas fa-user' },
    { key: 'phone_number', label: 'Telefon', icon: 'fas fa-phone' },
    { key: 'message_text', label: 'Mesaj', icon: 'fas fa-sms' },
    { key: 'sent_at', label: 'Gönderim Tarihi', icon: 'fas fa-clock', isDate: true }
  ];

  constructor(private apiService: Api, private titleService: Title) { }

  ngOnInit(): void {
    this.apiService.getSuccessfulSmsLogs().subscribe(data => {
      this.successfulLogs = data;
      this.isLoading = false;
    });
    this.titleService.setTitle('Doğum Günü SMS - Başarılı SMS');
  }
}
