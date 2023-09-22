import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterfacePlayListsComponent } from './interface-play-lists.component';

describe('InterfacePlayListsComponent', () => {
  let component: InterfacePlayListsComponent;
  let fixture: ComponentFixture<InterfacePlayListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterfacePlayListsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InterfacePlayListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
