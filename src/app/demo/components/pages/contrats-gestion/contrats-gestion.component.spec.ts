import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratsGestionComponent } from './contrats-gestion.component';

describe('ContratsGestionComponent', () => {
  let component: ContratsGestionComponent;
  let fixture: ComponentFixture<ContratsGestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContratsGestionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContratsGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
