import {Component, OnInit} from '@angular/core';
import {PageHeader} from '../../components/page-header/page-header';
import {FormsModule} from '@angular/forms';
import { Api } from '../../services/api';
import {NgClass} from '@angular/common';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    PageHeader, FormsModule, NgClass
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings implements OnInit {
  settings: any = {};
  message: string = '';
  isError: boolean = false;

  constructor(private apiService: Api, private titleService: Title) {}

  ngOnInit(): void {
    this.apiService.getSettings().subscribe(data => {
      this.settings = data;
    });
    this.titleService.setTitle('Doğum Günü SMS - Ayarlar');
  }

  saveSettings(): void {
    const userConfirmed = window.confirm('Ayarları kaydetmek istediğinizden emin misiniz?');
    if (!userConfirmed) {
      return;
    }

    this.message = '';
    this.apiService.saveSettings(this.settings).subscribe({
      next: (res) => {
        this.message = res.message;
        this.isError = false;
      },
      error: (err) => {
        this.message = err.error.message || 'Bilinmeyen bir hata oluştu.';
        this.isError = true;
      }
    });
  }
}
