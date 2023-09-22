import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DispositivoService } from '../../../services/dispositivo.service';
import { PlayListService } from '../../../services/play-list.service';
import { CancionService } from '../../../services/cancion.service';
import { ComandosService } from '../../../services/comandos.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-interface-add-play-list',
  templateUrl: './interface-add-play-list.component.html',
  styleUrls: ['./interface-add-play-list.component.css']
})
export class InterfaceAddPlayListComponent implements OnInit {


  loading = false;
  msgLoading = '';
  msgErrorLoading = '';

  msgExito = '';
  msgError = '';


  public dispositivo: any;

  paginacion = {
    items: 12,
    pagina: 1,
    paginaTotal: 0,
    totalItems: 0, 
  }
  btnAnt = true;
  btnSig = true;

  buscadorPlayList = false;

  public playLists: any[] = [];

  public playList: any;  // playList seleccionada para añadir al dispositivo

  constructor(private activareRoute: ActivatedRoute, 
    private dispositivoService: DispositivoService, 
    private playListService: PlayListService, 
    private router: Router,
    private cancionService: CancionService,
    private comandosService: ComandosService) { }

  ngOnInit(): void {
    this.activareRoute.params.subscribe((params: Params) => {
      this.getDispositivo(params.dispositivo);
      // this.getCanciones();
       this.getPlayList();
     
    });
  }

  getDispositivo(dispositivoId: string){

    this.buscadorPlayList = false;

    this.dispositivoService.verDispositivo(dispositivoId)
    .subscribe((resp: any) => {
        if(resp.ok){
          this.dispositivo = resp.device;
          console.log('El dispositico', this.dispositivo)
        }        
    });
   
  }

  redireccionarADispositivo(){
    this.router.navigateByUrl(`/admin/interface/dispositivo/addPlayLists/${this.dispositivo._id}`);
  }


  getPlayList(){

    const paginacion = `?items=${this.paginacion.items}&page=${this.paginacion.pagina}`;
    this.playListService.verPlayLists(paginacion)
    .subscribe((resp: any) => {      
         this.playLists = resp.playlists;
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
    this.getPlayList();

  }

  paginaSiguiente(): any {

      if (this.paginacion.pagina < this.paginacion.paginaTotal) {
          this.paginacion.pagina ++;
          this.btnAnt = true;
      } else {
          this.btnSig = false;
          return;
      }
      this.getPlayList();
  }

  playListSeleccionada(playList: any){

    console.log('Seleccionando', playList);

      let existe = this.dispositivo.playLists.find((playLists: any) => playLists?.playlist?._id === playList?._id);
      if(existe){
        alert('la playList ya se encuentra agregada en el dispositivo');
        return;
      }

      console.log('La consulta', existe)

      this.playList = playList;
  }


  agregarPlayListADispositivo(){
    

    if(!this.playList){
      return;
    }

    this.loading = true;
    this.msgLoading = 'Subiendo playList...';
    this.msgErrorLoading = '';

    this.dispositivoService.agregarPlayListADispositivo(this.dispositivo._id ,this.playList._id)
    .subscribe((resp: any) => {
      console.log('La Respuesta', resp)
      if(resp.ok){

         this.msgExito = resp.msg;
         this.getDispositivo(this.dispositivo._id);
         this.loading = false;
         this.msgLoading = '';
         this.msgErrorLoading = ''
         this.playList = '';
         alert('PlayList agregada con éxito.')
         return;

      }else{

        this.loading = false;
        this.msgLoading = '';

         this.msgErrorLoading = resp.msg;

      }



    }, (err: any) => {
        alert('Ey! ocurrió un error, intentalo nuevamente');
        this.loading = false;
        this.msgLoading = '';
        this.msgErrorLoading = '';
    });

  }


  urlDispositivo(){

    this.router.navigateByUrl(`admin/interface/dispositivo/${this.dispositivo._id}`)

  }

  reproducirCancion(cancion: any){

    console.log(cancion);
    this.cancionService.startPlayer(cancion);

  }


  buscarPlayList(termino: string){

    if(!termino){
      this.getPlayList();
      return
    }

    this.buscadorPlayList = true;
    this.playListService.buscarPlayList(termino)
    .subscribe((resp: any) => {
        if(resp.ok){
          console.log('respuesta', resp)
          this.playLists = resp.playLists;
          this.paginacion = {
            items: 12,
            pagina: 1,
            paginaTotal: 0,
            totalItems: this.playLists.length, 
          }
           
        }
    });
  }


}
