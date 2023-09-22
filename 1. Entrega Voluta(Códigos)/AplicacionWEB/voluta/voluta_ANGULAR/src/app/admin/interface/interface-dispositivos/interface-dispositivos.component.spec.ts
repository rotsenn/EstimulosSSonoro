import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterfaceDispositivosComponent } from './interface-dispositivos.component';

describe('InterfaceDispositivosComponent', () => {
  let component: InterfaceDispositivosComponent;
  let fixture: ComponentFixture<InterfaceDispositivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterfaceDispositivosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InterfaceDispositivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
