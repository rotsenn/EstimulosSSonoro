import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ValidarRolService } from '../../../services/validar-rol.service';

@Component({
  selector: 'app-dispositivo',
  templateUrl: './dispositivo.component.html',
  styleUrls: ['./dispositivo.component.css']
})
export class DispositivoComponent implements OnInit {

  constructor( private activateRoute: ActivatedRoute, private validarRol: ValidarRolService) { }

  ngOnInit(): void {
    this.activateRoute.params.subscribe((params: Params) => {
      // this.cancionesPlayList(params.playList);
    });
  }

}
