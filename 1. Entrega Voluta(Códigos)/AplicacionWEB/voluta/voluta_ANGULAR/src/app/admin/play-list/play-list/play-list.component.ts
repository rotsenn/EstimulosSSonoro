import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { PlayListService } from '../../../services/play-list.service';
import { ComandosService } from '../../../services/comandos.service';
import { environment } from 'src/environments/environment';
import { CancionService } from '../../../services/cancion.service';
import { ValidarRolService } from '../../../services/validar-rol.service';
import { Observable, of } from 'rxjs';
import { FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { DispositivoService } from '../../../services/dispositivo.service';

@Component({
  selector: 'app-play-list',
  templateUrl: './play-list.component.html',
  styleUrls: ['./play-list.component.css']
})
export class PlayListComponent implements OnInit {

  base_url_do = environment.base_url_do;  // dominio servidor de archivos (DigitalOsean)

  public playLis: any;

  public addSong = false;


  cancionesCtrl = new FormControl();
  filtroCanciones: Observable<any[]>;
  busquedaCancion = false;

  public playLists:any[] = [];



///////////////////////CXanciones
  canciones: any[] = [];

  cancionSubir: any;
  cancionSubirID = '';

  paginacion = {
    items: 12,
    pagina: 1,
    paginaTotal: 0,
    totalItems: 0, 
  }
  btnAnt = true;
  btnSig = true;

  addPlayList:any[] =[];

  generos:any[] = [];

  public duracionPlayList: number = 0;

  loading = false;


  constructor(private activareRoute: ActivatedRoute, 
    private playList: PlayListService,
    private comandoService: ComandosService,
    private cancionService: CancionService,
    private validarRol: ValidarRolService,
    private dispositivoService: DispositivoService) { 

      this.filtroCanciones = this.cancionesCtrl.valueChanges.pipe(        
        startWith(''),
        map(song => (song ? this._filtroCanciones(song) : this.playLists.slice()) ),
      );

    }

  ngOnInit(): void {
    this.activareRoute.params.subscribe((params: Params) => {
      this.getPlayList(params.playList);
      this. getCanciones();
    });
  }

  private _filtroCanciones(value: string): any[] {
    console.log('Entra', value) 
    if(!value){
      console.log('Ho hay valor');
     this.filtroCanciones = of();
    }
    
     const minusculaValue = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
     // return this.playLists.filter(playList => playList.playlist.name.toLowerCase().includes(minusculaValue));
     return this.playLis?.songs.filter((songs: any) => songs.song.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(minusculaValue));

  }



  getPlayList(playList: any){
    return  this.playList.verPlaylist(playList)
    .subscribe((resp: any) => {
        if (resp.ok){
            this.playLis = resp.playList
            this.addPlayList.push({ playList: playList } );
            for(let c of this.playLis.songs ){
              this.duracionPlayList = this.duracionPlayList + c.song.duration;
              // this.duracionPlayList = this.duracionPlayList + resp.playList.song.duration;
             }
        }
    })
  }



  startPlayer(song: any){

    console.log('LLEGA', song)

    let song_player = JSON.stringify(song);

    let filePath = `${environment.base_url_do}/v1/upload/songs/${song.file}`
    let imagen = 'imagen del album';

    localStorage.setItem('cancion_sonando', song_player );
    document.getElementById("mp3-source")?.setAttribute("src", filePath);

    (document.getElementById("player") as any).load();
    (document.getElementById("player") as any).play();
}


  cargarM3UPlayList(){

    console.log('Creando m3u')       
    this.playList.crearM3UPlayList(this.playLis._id)
    .subscribe((resp: any) => {
        if(resp.ok){
          console.log('Creó m3u con éxito');
          this.comando(`download http://68.183.142.245/api/v1/upload/playLists/${this.playLis._id}.m3u`)
        }
    });

  }


  comando(comando: string){

    if(!comando){
      return;
    }

    console.log('Subiendo al dispositivo')
    this.comandoService.comandoDispositivo(comando, `rpi-02`)
    .subscribe((resp: any) => {
        
        console.log(resp)
        console.log('Subió')



    }, (err: any) => console.log('Error', err))
 }
 


 reproducir(){
    this.comando('mpc clear');
    setTimeout(() => {
      this.comando(`mpc load ${this.playLis._id }`);
    },500);
 }


  getCanciones(){
    const paginacion = `?items=${this.paginacion.items}&page=${this.paginacion.pagina}`;
    this.cancionService.verCancioes(paginacion)
    .subscribe((resp: any) => {
          console.log('LA CANCIONES', resp)
        this.canciones = resp.songs;
        this.paginacion.paginaTotal = resp.total_pages;
        this.paginacion.totalItems = resp.total;

    });

  }

  cancionAddPlayList(cancionId: string){

    this.cancionService.guardarCancionEnPlayLists(cancionId, this.addPlayList)
    .subscribe((resp: any) => {

      if(resp.ok){
        this.getPlayList(this.playLis._id)
      }
          console.log(resp);
    });

  }


  quitarCancionPlayList(cancionId: string){

      console.log('Entro', cancionId );

      if(!cancionId){
        return
      }

      this.playList.quitarCancionDeLaPlayList(cancionId, this.playLis._id)
      .subscribe((resp: any) => {
        console.log(resp);
        if(resp.ok){
          this.getPlayList(this.playLis._id);
        }
            
      });

  }


  reproducirCancion(cancion: any){

    console.log(this.canciones);
    // this.cancionService.startPlayer(cancion);

    
    let reproduccionAnterior = this.playLis.songs.find((resp: any) => resp.song.rp === true );
    let reproducir = this.playLis.songs.find((resp:any) => resp.song._id === cancion._id );
    

    let song_player = JSON.stringify(cancion);

    let filePath = `${environment.base_url_do}/v1/upload/songs/${cancion.file}`

    localStorage.setItem('cancion_sonando', song_player );
    document.getElementById("mp3-source")?.setAttribute("src", filePath);

    (document.getElementById("player") as any).load();

    if(!reproducir.song.rp){


        (document.getElementById("player") as any).play();
         reproducir.song.rp = true;
         if(reproduccionAnterior){
           reproduccionAnterior.song.rp = false;
         }
         

    }else{


        (document.getElementById("player") as any).pause();
        reproducir.song.rp = false;
        reproduccionAnterior.song.rp = false;
    }
    

    //@ts-ignore
    document.getElementById("play-song-title").innerHTML =  '<i class="icon-music-tone"></i>'+cancion.name;



  

  }


  sincronizarConDispositivo(){

      let playListId = this.playLis._id;

      this.loading = true;

      this.dispositivoService.sincronizarPlayListsEnDispositivos(playListId)
      .subscribe((resp: any) => {

           if(resp.ok){
              alert('Éxito! .. '+ resp.msg);
              this.loading = false;
              return
           }
           this.loading = false;

      }, (err: any) => {

        this.loading = false;
        alert('Ey! acurrió un error y no se pudo sincronizar, intentalo nuevamente.')

      });


  }



}
