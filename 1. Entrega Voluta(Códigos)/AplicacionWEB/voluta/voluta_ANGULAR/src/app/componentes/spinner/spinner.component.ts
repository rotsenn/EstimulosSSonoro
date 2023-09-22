import { Component, OnInit } from '@angular/core';
import { SpinnerService } from '../../services/spinner.service';

@Component({
  selector: 'app-spinner',
  template: ` 
  <div class="overlay" *ngIf="isLoading$ | async">
  <div class="lds-facebook"><div></div><div></div><div></div></div>
  </div>`,
  styleUrls: ['./spinner.component.css'],

})
export class SpinnerComponent {

  cargar = true

  constructor( private spinnerService: SpinnerService) { }

  isLoading$ = this.spinnerService.isLoading$;



}
