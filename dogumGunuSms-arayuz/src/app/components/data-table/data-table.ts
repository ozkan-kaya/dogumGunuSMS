import { Component, Input, OnInit } from '@angular/core';
import {DatePipe, NgClass} from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  icon?: string;
  isDate?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgClass, DatePipe],
  templateUrl: './data-table.html',
  styleUrls: ['./data-table.css']
})
export class DataTable implements OnInit {
  @Input() title: string = 'Liste';
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() isLoading: boolean = true;
  @Input() badgeText: string = '';
  @Input() badgeClass: string = 'bg-primary';

  sortKey: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  ngOnInit(): void {
    if (this.columns.length > 0) {
      this.sortKey = this.columns[0].key;
    }
  }

  onSort(key: string): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
  }
  get sortedData(): any[] {
    if (!this.data || this.data.length === 0) {
      return [];
    }

    return [...this.data].sort((a, b) => {
      const valA = a[this.sortKey];
      const valB = b[this.sortKey];

      let comparison = 0;
      if (valA > valB) {
        comparison = 1;
      } else if (valA < valB) {
        comparison = -1;
      }

      return this.sortDirection === 'desc' ? comparison * -1 : comparison;
    });
  }
}
