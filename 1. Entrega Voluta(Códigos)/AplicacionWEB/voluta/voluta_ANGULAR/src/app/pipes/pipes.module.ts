import { NgModule } from '@angular/core';
import { ImagenPipe } from './imagen.pipe';
import { MusicaPipe } from './musica.pipe';
import { ConvertirSegundosPipe } from './convertir-segundos.pipe';



@NgModule({
  declarations: [
    ImagenPipe,
    MusicaPipe,
    ConvertirSegundosPipe
  ],
  exports:[
    ImagenPipe,
    MusicaPipe,
    ConvertirSegundosPipe
  ]
})
export class PipesModule { }
