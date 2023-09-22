import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerComponent } from './player/player.component';
import { PipesModule } from '../pipes/pipes.module';
import { SpinnerComponent } from './spinner/spinner.component';



@NgModule({
  declarations: [
    PlayerComponent,
    SpinnerComponent
  ],
  imports: [
    CommonModule,
    PipesModule
  ],
  exports:[
    PlayerComponent,
    SpinnerComponent
  ]
})
export class ComponentesModule { }
