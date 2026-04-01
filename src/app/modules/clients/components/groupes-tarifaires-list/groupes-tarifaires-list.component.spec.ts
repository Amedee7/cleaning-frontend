import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupesTarifairesListComponent } from './groupes-tarifaires-list.component';

describe('GroupesTarifairesListComponent', () => {
  let component: GroupesTarifairesListComponent;
  let fixture: ComponentFixture<GroupesTarifairesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupesTarifairesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupesTarifairesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
