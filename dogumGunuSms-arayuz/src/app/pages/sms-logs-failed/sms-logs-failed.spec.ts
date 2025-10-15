import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsLogsFailed } from './sms-logs-failed';

describe('SmsLogsFailed', () => {
  let component: SmsLogsFailed;
  let fixture: ComponentFixture<SmsLogsFailed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmsLogsFailed]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmsLogsFailed);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
