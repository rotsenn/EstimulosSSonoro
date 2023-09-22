import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterfacePlayListComponent } from './interface-play-list.component';

describe('InterfacePlayListComponent', () => {
  let component: InterfacePlayListComponent;
  let fixture: ComponentFixture<InterfacePlayListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterfacePlayListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InterfacePlayListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
