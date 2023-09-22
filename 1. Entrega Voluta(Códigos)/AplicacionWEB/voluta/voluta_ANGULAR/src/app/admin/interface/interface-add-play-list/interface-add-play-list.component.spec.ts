import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterfaceAddPlayListComponent } from './interface-add-play-list.component';

describe('InterfaceAddPlayListComponent', () => {
  let component: InterfaceAddPlayListComponent;
  let fixture: ComponentFixture<InterfaceAddPlayListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterfaceAddPlayListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InterfaceAddPlayListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
