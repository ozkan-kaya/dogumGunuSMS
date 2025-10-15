import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsLogsSuccess } from './sms-logs-success';

describe('SmsLogsSuccess', () => {
  let component: SmsLogsSuccess;
  let fixture: ComponentFixture<SmsLogsSuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmsLogsSuccess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmsLogsSuccess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
