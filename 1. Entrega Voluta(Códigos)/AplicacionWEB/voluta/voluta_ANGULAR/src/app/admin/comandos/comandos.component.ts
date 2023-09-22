import { Component, OnInit } from '@angular/core';
import { ComandosService } from '../../services/comandos.service';

@Component({
  selector: 'app-comandos',
  templateUrl: './comandos.component.html',
  styleUrls: ['./comandos.component.css']
})
export class ComandosComponent implements OnInit {

  response: any;
  cargando = false;

  id = '';
  displayName = '';

  dispositivos: any[] = [];

  constructor(private comand: ComandosService) { }

  ngOnInit(): void {
    this.getDispositivos();
  }

  comando(comando: string){

      if(!comando){
        return;
      }

      this.cargando = true;
      this.comand.comandoDispositivo(comando, `rpi-02`)
      .subscribe((resp: any) => {
          console.log(resp)
          this.response = resp.response
          this.cargando = false;

      }, (err: any) => {this.response = err.error; this.cargando = false})
  }

  eventoVolumen(evento: any){
        if(!evento){
          return;
        }

        this.cargando = true;
        console.log(`mpc volume ${evento}%`);
         this.comand.comandoDispositivo(`mpc volume ${evento}`, 'rpi-02')
         .subscribe((resp: any) => {
           console.log(resp)
           this.response = resp.response;
           this.cargando = false;
         }, (err: any) => {this.response = err.error; this.cargando = false})
  }


  getDispositivos(){
    this.comand.getDispositivos()
    .subscribe((resp: any) => {
      if(resp.ok){
        this.dispositivos = resp.devices;
      }       
    })
  }

  crearDispositivo(){

    console.log('entró')

    if(this.id === '' || this.displayName===''){
      alert('Los datos son requeridos');
      return;
    }

    let data = {
      "id": this.id,
      "displayName": this.displayName,
      "template": "dtmi:uyiqlyyl0u:kwskgbtljr",
      "simulated": true,
      "enabled": true
    }

    this.comand.crearDispositivo(data)
    .subscribe((resp: any) => {
       if(resp.ok){
          this.getDispositivos();
       }
    })



  }

}
