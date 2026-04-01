import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarOrdersComponent } from './calendar-orders.component';

describe('CalendarOrdersComponent', () => {
  let component: CalendarOrdersComponent;
  let fixture: ComponentFixture<CalendarOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarOrdersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
