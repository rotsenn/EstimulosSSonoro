import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DispositivoService } from '../../../services/dispositivo.service';

@Component({
  selector: 'app-interface-dispositivos',
  templateUrl: './interface-dispositivos.component.html',
  styleUrls: ['./interface-dispositivos.component.css']
})
export class InterfaceDispositivosComponent implements OnInit {

  buscadorDispositivo = false;

  public dispositivos: any[] =[];

  paginacion = {
    items: 18,
    pagina: 1,
    paginaTotal: 0,
    totalItems: 0, 
  }

  btnAnt = true;
  btnSig = true;

  constructor(private dispositivoService: DispositivoService,
    private router: Router) { }

  ngOnInit(): void {
    this.getDispositivos();
  }

  getDispositivos(){

    this.buscadorDispositivo = false;
    const paginacion = `?items=${this.paginacion.items}&page=${this.paginacion.pagina}`;
    this.dispositivoService.verDispositivos(paginacion)
    .subscribe((resp: any) => {     
      console.log(resp); 
         this.dispositivos = resp.device;
         this.paginacion.paginaTotal = resp.total_pages;
         this.paginacion.totalItems = resp.total;
     });

  }

  paginaAnterior(): any {

    if (this.paginacion.pagina > 1) {

        this.paginacion.pagina --;
        this.btnSig = true;

    }else {
        this.btnAnt = false;
        return;
    }
    this.getDispositivos();

}

paginaSiguiente(): any {

    if (this.paginacion.pagina < this.paginacion.paginaTotal) {

        this.paginacion.pagina ++;
        this.btnAnt = true;

    } else {

        this.btnSig = false;
        return;

    }
    this.getDispositivos();

}

buscarDispositivo(termino: string){
  console.log(termino)
   if(!termino){
      this.getDispositivos()
      return;
   }
   this.buscadorDispositivo = true;

   this.dispositivoService.buscarDispositivo(termino)
   .subscribe((resp: any) => {      
        this.dispositivos = resp.devices;
        this.paginacion = {
         items: 18,
         pagina: 1,
         paginaTotal: 0,
         totalItems: 0, 
       }
    });

 }


  detalleDispositivo(dispositivoId: string){

       this.router.navigateByUrl(`/admin/interface/dispositivo/${dispositivoId}`)

  }


  cambiarItem(item: string){
    if(item === ""){
      return;
    }
    this.paginacion = {
      items: 14,
      pagina: 1,
      paginaTotal: 0,
      totalItems: 0, 
    }
    console.log(item)
      this.paginacion.items = Number(item);
      this.getDispositivos();
  }

}
