import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReproductorService {

  public reproduciendo = '';
  constructor() {}

  reproducir(cancion: string){

    this.reproduciendo = cancion;

    console.log(this.reproduciendo)

  }

}
