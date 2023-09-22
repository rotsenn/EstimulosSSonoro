import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { PlayListService } from '../../../services/play-list.service';
import { CancionService } from '../../../services/cancion.service';
import { environment } from '../../../../environments/environment';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map,} from 'rxjs/operators';
import {  of } from "rxjs";


@Component({
  selector: 'app-interface-play-list',
  templateUrl: './interface-play-list.component.html',
  styleUrls: ['./interface-play-list.component.css']
})
export class InterfacePlayListComponent implements OnInit {

  base_url_do = environment.base_url_do;  // dominio servidor de archivos (DigitalOsean)


  cancionesCtrl = new FormControl();
  filtroCanciones: Observable<any[]>;
  busquedaCancion = false;

  public playLis: any;

  public canciones:any[] = [];
  public duracionPlayList: number = 0;
  paginacion = {  // paginacionCanciones
    items: 15,
    pagina: 1,
    paginaTotal: 0,
    totalItems: 0, 
  }
  btnAntC = true;
  btnSigC = true;


  public playLists:any[] = [];
  paginacionPl = {  // paginacionCanciones
    items: 20,
    pagina: 1,
    paginaTotal: 0,
    totalItems: 0, 
  }
  btnAntP = true;
  btnSigP = true;

  buscadorPlayList = false;
  buscadorCancion = false;

  constructor(private activareRoute: ActivatedRoute, 
    private playList: PlayListService, 
    private cancionService: CancionService, 
    private router: Router,) {

      this.filtroCanciones = this.cancionesCtrl.valueChanges.pipe(        
        startWith(''),
        map(song => (song ? this._filtroCanciones(song) : this.playLists.slice()) ),
      );

     }

  ngOnInit(): void {
    this.activareRoute.params.subscribe((params: Params) => {
      this.getPlayList(params.playList);
      this.getCanciones();
      this.getPlayLists();
     
    });
  }


  private _filtroCanciones(value: string): any[] {

     if(!value){

      this.filtroCanciones = of();
     }
     
      const minusculaValue = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      // return this.playLists.filter(playList => playList.playlist.name.toLowerCase().includes(minusculaValue));
      return this.playLis?.songs.filter((songs: any) => songs.song.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(minusculaValue));

   }


    getPlayList(playList: any) {
      this.duracionPlayList = 0;
      return  this.playList.verPlaylist(playList)
      .subscribe((resp: any) => {
          if (resp.ok){
              this.playLis = resp.playList

              for(let c of this.playLis.songs ){
                  this.duracionPlayList = this.duracionPlayList + c.song.duration;
                  // this.duracionPlayList = this.duracionPlayList + resp.playList.song.duration;
              }
          }
      })
    }


  getCanciones(){

    this.buscadorCancion = false;
    const paginacion = `?items=${this.paginacion.items}&page=${this.paginacion.pagina}`;
    this.cancionService.verCancioes(paginacion)
    .subscribe((resp: any) => {
     
         this.canciones = resp.songs;
         this.paginacion.paginaTotal = resp.total_pages;
         this.paginacion.totalItems = resp.total;



     });

  }

  getPlayLists(){

    this.buscadorPlayList = false;
    const paginacion = `?items=${this.paginacionPl.items}&page=${this.paginacionPl.pagina}`;
    this.playList.verPlayLists(paginacion)
    .subscribe((resp: any) => {      
         this.playLists = resp.playlists;
         this.paginacionPl.paginaTotal = resp.total_pages;
         this.paginacionPl.totalItems = resp.total;
     }); 

  }


  cargarPlayList(playListId: string){
    this.router.navigateByUrl(`/admin/interface/playList/${playListId}`)
  }


  reproducirCancion(cancion: any, tipo: "pl"|"c"){

    let reproduccionAnterior1 = this.canciones.find(resp => resp.rp === true );
    let reproducir1 = this.canciones.find(resp => resp._id === cancion._id );

    let reproduccionAnterior2 = this.playLis.songs.find((resp: any) => resp.song.rp === true );  
    let reproducir2 = this.playLis.songs.find((resp: any) => resp.song._id === cancion._id );


    let song_player = JSON.stringify(cancion);
    let filePath = `${environment.base_url_do}/v1/upload/songs/${cancion.file}`
 
    localStorage.setItem('cancion_sonando', song_player );
    document.getElementById("mp3-source")?.setAttribute("src", filePath);
 
    (document.getElementById("player") as any).load();

   

    if(tipo === "pl"){

        if(!reproducir2.song.rp){
    
            (document.getElementById("player") as any).play();
            (document.getElementById("player") as any).addEventListener("ended", function(){
              reproducir2.song.rp = false;
            });

            reproducir2.song.rp = true;
            if(reproduccionAnterior2){
              reproduccionAnterior2.song.rp = false;
            }
            if(reproduccionAnterior1){
              reproduccionAnterior1.rp = false;
            }
            
    
        }else{
    
        
            (document.getElementById("player") as any).pause();
            (document.getElementById("player") as any).addEventListener("ended", function(){
              reproducir2.song.rp = false;
            });
            reproducir2.song.rp = false;
            reproduccionAnterior2.song.rp = false;
            if(reproduccionAnterior1){
              reproduccionAnterior1.rp = false;
            }

        }

       

    }

    if(tipo === "c"){


      if(!reproducir1.rp){
    
          (document.getElementById("player") as any).play();
          (document.getElementById("player") as any).addEventListener("ended", function(){
            reproducir1.rp = false;
          });

          reproducir1.rp = true;
          if(reproduccionAnterior1){
            reproduccionAnterior1.rp = false;
          } 
          if(reproduccionAnterior2){
            reproduccionAnterior2.song.rp = false;
          }       

      }else{
      
          (document.getElementById("player") as any).pause();
          (document.getElementById("player") as any).addEventListener("ended", function(){
            reproducir1.song.rp = false;
          });
          reproducir1.rp = false;
          reproduccionAnterior1.rp = false;
          if(reproduccionAnterior2){
            reproduccionAnterior2.song.rp = false;
          }
      }


    }



   //@ts-ignore
   document.getElementById("play-song-title").innerHTML =  '<i class="icon-music-tone"></i>'+cancion.name;



  }


  agregarCancionAPlayList(cancion: any){

      if(!cancion){
        return;
      }

      this.playList.agregarCancionPlayList(this.playLis._id, cancion._id)
      .subscribe((resp: any) => {

        if(resp.ok){
          this.getPlayList(this.playLis._id);
        }else{
          alert(resp.msg);
        }

           
      });

  }


  quitarCancionPlayList(cancionId: string){



    if(!cancionId){
      return
    }

    this.playList.quitarCancionDeLaPlayList(cancionId, this.playLis._id)
    .subscribe((resp: any) => {
 
      if(resp.ok){
        this.getPlayList(this.playLis._id);
      }
          
    });

  }

  buscarPlayList(termino: string){
    if(!termino){
      this.getPlayLists();
      return
    }

    this.buscadorPlayList = true;

    this.playList.buscarPlayList(termino)
    .subscribe((resp: any) => {
        if(resp.ok){
        
          this.playLists = resp.playLists;
          this.paginacionPl = {
            items: 20,
            pagina: 1,
            paginaTotal: 0,
            totalItems: this.playLists.length, 
          }
           
        }
    });
  }


  buscarCancionPlayList(termino: any){ // Buscar canción playList



  }

  buscarCancion(termino: string){
    if(!termino){
      this.getCanciones();
      return
    }

    this.buscadorCancion = true;

    this.cancionService.buscarCancion(termino)
    .subscribe((resp: any) => {
        if(resp.ok){

          this.canciones = resp.songs;
          this.paginacion = {
            items: 20,
            pagina: 1,
            paginaTotal: 0,
            totalItems: this.playLists.length, 
          }
           
        }
    });
}



paginaAnteriorC(): any {

  if (this.paginacion.pagina > 1) {

     this.paginacion.pagina --;
     this.btnSigC = true;

  }else {
    this.btnAntC = false;
    return;
  }

  this.getCanciones();  

}



paginaSiguienteC(): any {  

  if (this.paginacion.pagina < this.paginacion.paginaTotal) {  

    this.paginacion.pagina ++;
    this.btnAntC = true;

  } else {

    this.btnSigC = false;
    return;

  }

  this.getCanciones();


}



paginaAnteriorPL(): any {

  if (this.paginacionPl.pagina > 1) {

     this.paginacionPl.pagina --;
     this.btnSigP = true;

  }else {
    this.btnAntP = false;
    return;
  }

  this.getPlayLists();  

}



paginaSiguientePL(): any {  

  if (this.paginacionPl.pagina < this.paginacionPl.paginaTotal) {  

    this.paginacionPl.pagina ++;
    this.btnAntP = true;

  } else {

    this.btnSigP = false;
    return;

  }

  this.getPlayLists();


}



}
