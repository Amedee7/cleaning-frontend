import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsLateComponent } from './payments-late.component';

describe('PaymentsLateComponent', () => {
  let component: PaymentsLateComponent;
  let fixture: ComponentFixture<PaymentsLateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsLateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentsLateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
