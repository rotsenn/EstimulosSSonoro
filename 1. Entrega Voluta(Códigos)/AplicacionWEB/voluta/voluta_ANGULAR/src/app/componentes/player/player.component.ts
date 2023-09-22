import { Component, OnInit } from '@angular/core';
import { CancionService } from '../../services/cancion.service';
import { ReproductorService } from '../../services/reproductor.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {

  public url: string;
  public song = 'Hola'

  constructor(public reproductor: ReproductorService) {
      this.url = '';
   
   }

  ngOnInit(): void {
  }

}
