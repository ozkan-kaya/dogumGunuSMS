import { Component, OnInit } from '@angular/core';
import { PageHeader } from '../../components/page-header/page-header';
import { Api } from '../../services/api';
import { DataTable, TableColumn } from '../../components/data-table/data-table';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [PageHeader, DataTable],
  templateUrl: './employees.html',
  styleUrls: ['./employees.css']
})
export class Employees implements OnInit {
  employees: any[] = [];
  isLoading = true;

  employeeColumns: TableColumn[] = [
    { key: 'id', label: '#' },
    { key: 'name', label: 'Ad Soyad', icon: 'fas fa-user' },
    { key: 'phone_number', label: 'Telefon', icon: 'fas fa-phone' },
    { key: 'birthday', label: 'Doğum Tarihi', icon: 'fas fa-birthday-cake', isDate: true },
    { key: 'age', label: 'Yaş', icon: 'fas fa-calendar' }
  ];

  constructor(private apiService: Api, private titleService: Title) { }

  ngOnInit(): void {
    this.apiService.getEmployees().subscribe(data => {
      this.employees = data;
      this.isLoading = false;
    });
    this.titleService.setTitle('Doğum Günü SMS - Personeller');
  }
}
