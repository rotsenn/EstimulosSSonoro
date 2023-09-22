import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterfaceDispositivoComponent } from './interface-dispositivo.component';

describe('InterfaceDispositivoComponent', () => {
  let component: InterfaceDispositivoComponent;
  let fixture: ComponentFixture<InterfaceDispositivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterfaceDispositivoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InterfaceDispositivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
