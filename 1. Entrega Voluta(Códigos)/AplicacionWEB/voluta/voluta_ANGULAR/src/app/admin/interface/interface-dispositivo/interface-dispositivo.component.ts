import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DispositivoService } from '../../../services/dispositivo.service';
import { PlayListService } from '../../../services/play-list.service';
import { CancionService } from '../../../services/cancion.service';
import * as moment from 'moment';
import { map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { SpinnerService } from '../../../services/spinner.service';
import { environment } from 'src/environments/environment';

export interface State {
  flag: string;
  name: string;
  population: string;
}

@Component({
  selector: 'app-interface-dispositivo',
  templateUrl: './interface-dispositivo.component.html',
  styleUrls: ['./interface-dispositivo.component.css']
})



export class InterfaceDispositivoComponent implements OnInit, OnDestroy {

  loading = false;
  msgError = '';

  estadoActualDispositivo: any;

  crearTarea = false;

  data = {

      title: '',
      playList:'',
      description: '',
      startDate: '' ,
      startHour: '',
      endDate: '' ,
      endHour: '',
      shuffle: false,  // barajar
      repeat: false,
      random: false,

  }

  playListBusquedaSeleccionada = '';

  minDate: Date;
  maxDate: Date;

  reproduciendoTipoCancion = true;  // true = cancion y false = playList

  public modo = false;
  public tipoModo = 'Local';

  public dispositivo?: any;
  public canciones: any[] = [];
  public nombrePlayListSeleccionada = ''; 
  public playListSeleccionada: any;

  public nombrePlayListForm = '';  // se carga nombre de la playlist en metodo cargarDataTarea()

  /////////
  volumen = 1
  cancionSonando = '';
  siguienteCancion = '';
  siguienteEvento = '';
  fechaSiguienteEvento = '';




  /////////////////////////////////////////////////////////////

  playListCtrl = new FormControl();
  filteredPlayList: Observable<any[]>;
  
  playLists: any[] = []; // Se almacenan todas las playLists del dispositivo

 

  constructor(private activareRoute: ActivatedRoute, private dispositivoService: DispositivoService, private router: Router,
    private playListService: PlayListService, private cancionService: CancionService, private spinnerService: SpinnerService) {

      
        const currentYear = new Date().getFullYear();
        this.minDate = new Date(currentYear - 20, 0, 1);
        this.maxDate = new Date(currentYear + 1, 11, 31);


        this.filteredPlayList = this.playListCtrl.valueChanges.pipe(        
          startWith(''),
          map(playList => (playList ? this._filterPlaylists(playList) : this.playLists.slice()) ),
        );
  

     }


     private _filterPlaylists(value: string): any[] {
      // console.log('Entra', value) 
      this.busqueda(value);
      const filterValue = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      // return this.playLists.filter(playList => playList.playlist.name.toLowerCase().includes(filterValue));
      return this.playLists.filter(playList => playList.playlist.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(filterValue));
     }

     busqueda(value: string){
       if(!value){
         return;
       }
         let busqueda = this.playLists.find(resp => resp.playlist.name === value);
         if(!busqueda){return;}
         this.data.playList = busqueda.playlist._id;
         console.log(this.data);
     }



  ngOnInit(): void {
    this.destruirSetInterval();
    this.activareRoute.params.subscribe((params: Params) => {
      this.getDispositivo(params.dispositivo);
  
    
    });
  }





  getDispositivo(dispositivoId: string){

    this.dispositivoService.verDispositivo(dispositivoId)
    .subscribe((resp: any) => {
        if(resp.ok){
          this.dispositivo = resp.device;
          this.comandoNativoMpc('status');
          this.estadoDispositivo();  
          this.playLists = this.dispositivo.playLists;
          this.getTareas();
          
        }        
    });
   
  }

  redireccionarAddPlayList(){
    this.router.navigateByUrl(`/admin/interface/dispositivo/addPlayLists/${this.dispositivo._id}`);
  }

  verCancionesPlayList(playListId: string){

      
      this.canciones = [];
      this.playListService.verPlaylist(playListId)
      .subscribe((resp: any) => {
        if(resp.ok){
          this.canciones = resp.playList.songs;
          this.nombrePlayListSeleccionada =  resp.playList.name;
          this.playListSeleccionada = resp.playList;
        }           
      });

  }

  quitarPlayList(playListId: string){
       if(!playListId){
         return
       }

       this.dispositivoService.quitarPlayListDispositivo(this.dispositivo._id, playListId)
       .subscribe((resp: any) => {
          if(resp.ok){
            this.canciones=[];
            this.getDispositivo(this.dispositivo._id);
            this.canciones=[];
          }
       }, (err: any) => {
          console.log(err);
       })
          
  }

  reproducirCancion(cancion: any){

    console.log('TODASS', this.canciones)

    let reproduccionAnterior = this.canciones.find(resp => resp.song.rp === true );
    let reproducir = this.canciones.find(resp => resp.song._id === cancion._id );

    console.log(reproduccionAnterior);
    console.log(reproducir);

    // this.cancionService.startPlayer(cancion);

    let song_player = JSON.stringify(cancion);

    let filePath = `${environment.base_url_do}/v1/upload/songs/${cancion.file}`;
    
    localStorage.setItem('cancion_sonando', song_player );
    document.getElementById("mp3-source")?.setAttribute("src", filePath);

    (document.getElementById("player") as any).load();
    (document.getElementById("player") as any).play();

    (document.getElementById("player") as any).addEventListener("ended", function(){
       reproducir.song.rp = false;
    });

    //@ts-ignore
    document.getElementById("play-song-title").innerHTML =  '<i class="icon-music-tone"></i>'+cancion.name;

    if(!reproducir.song.rp){

    
      (document.getElementById("player") as any).play();
      reproducir.song.rp = true;
      if(reproduccionAnterior){
        reproduccionAnterior.song.rp = false;
      }
      if(reproduccionAnterior){
        reproduccionAnterior.rp = false;
      }
      

  }else{

  
      (document.getElementById("player") as any).pause();
      reproducir.song.rp = false;
      reproduccionAnterior.song.rp = false;
      if(reproduccionAnterior){
        reproduccionAnterior.rp = false;
      }

  }

  

  }

  cambiarModoReproducir(){
    if(!this.modo){ 
      this.tipoModo = 'Dispositivo'
      this.modo = true;
    }else{
      this.tipoModo = 'Local'
      this.modo = false;
      
    }
  }



  //////////////////////////PROGRAMAR TAREA PLAYLIST

  paginacion = {
    items: 14,
    pagina: 1,
    paginaTotal: 0,
    totalItems: 0, 
  }
  btnAnt = true;
  btnSig = true;

  buscadorTarea = false;
  tareas: any[] = [];
  editar = false;

  tituloTareaEliminar = '';
  inputTareaEliminar = '';
  tareaIdEliminar = '';

  tareaIdEditar= '';

  contador: any = 0;

  getTareas(){

    this.buscadorTarea = false;
    const paginacion = `?items=${this.paginacion.items}&page=${this.paginacion.pagina}`;
    this.dispositivoService.getTareas(this.dispositivo._id, paginacion)
    .subscribe((resp: any) => {  
   
         this.tareas = resp.tasks;
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
    this.getTareas();

  }

  paginaSiguiente(): any {

      if (this.paginacion.pagina < this.paginacion.paginaTotal) {
          this.paginacion.pagina ++;
          this.btnAnt = true;
      } else {
          this.btnSig = false;
          return;
      }
      this.getTareas();
  }


  // buscarTarea(termino: string){  // TODO:: PENDIENTE

  //   if(!termino){
  //     this.getTareas();
  //     return;
  //   }
  //   this.buscadorTarea = false;

  //   this.dispositivoService.buscarTarea(this.dispositivo._id, termino)
  //   .subscribe((resp: any) => {
  //       if(resp.ok){
  //         console.log('respuesta', resp)
  //         this.playLists = resp.playLists;
  //         this.paginacion = {
  //           items: 14,
  //           pagina: 1,
  //           paginaTotal: 0,
  //           totalItems: this.playLists.length, 
  //         }
           
  //       }
  //   });

  // }

  
  fechaSeleccionadaProgramacion(evento: any, fecha: any){

        console.log('Evento', evento)

        const m = evento.value;
        // console.log(moment(new Date(m)).format('YYYY-MM-DD'))

         if(fecha === 'inicial'){
             this.data.startDate = moment(new Date(m)).format('YYYY-MM-DD')
         } else if(fecha === 'final'){
             this.data.endDate = moment(new Date(m)).format('YYYY-MM-DD')
         }


  }


  programarTarea(){
    this.msgError = ''
    console.log(this.data);
    if(this.data.title === ''  || this.data.description === '' || this.data.playList === '' || this.data.startDate === '' || this.data.startHour === '' || this.data.endDate ==='' || this.data.endHour === '' ) {
         alert('Todos los campos son obligatorios'); 
         return;
    }

    this.loading = true;

    this.dispositivoService.crearTarea(this.dispositivo._id, this.data)
    .subscribe((resp: any) => {
      if(resp.ok){
        alert('Tarea creada con éxito');
        this.loading = false;
        this.getTareas();
        this.crearTarea = false;
        return;
      }
      this.loading = false;
    }, (err: any) => {
       this.msgError = err.error.msg;
       this.loading = false;
    });
   
  }

  cargarDataTarea(tareaId: string){

    let buscar = this.tareas.find(tareas => tareas._id === tareaId);
    if(!buscar){
      return;
    }
  

    let data = {

        title: buscar.title,
        playList:buscar.playList._id,
        description: buscar.description,
        startDate: buscar.startDate ,
        startHour: buscar.startHour,
        endDate: buscar.endDate ,
        endHour: buscar.endHour,
        shuffle: buscar.shuffle || false,  // barajar
        repeat: buscar.repeat || false,
        random: buscar.random || false,

    }
    this.nombrePlayListForm = buscar.playList.name;
    this.tareaIdEditar = tareaId;
   
    this.crearTarea = true;
    this.data = data;
    this.editar = true;

  }


  editarTarea(){    
    this.msgError = ''
    console.log(this.data);
    if(this.data.title === ''  || this.data.description === '' || this.data.playList === '' || this.data.startDate === '' || this.data.startHour === '' || this.data.endDate ==='' || this.data.endHour === '' || this.tareaIdEditar === '' ) {
         alert('Todos los campos son obligatorios.'); 
         return;
    }

    this.loading = true;

    this.dispositivoService.editarTarea(this.dispositivo._id, this.data, this.tareaIdEditar)
    .subscribe((resp: any) => {
      if(resp.ok){
        alert('Tarea actualizada con éxito');
        this.loading = false;
        this.getTareas();
        this.crearTarea = false;
        this.vaciarData();
      }
    }, (err:any) => {
       this.loading = false;
       this.msgError = err.error.msg;
    });
 
  }


  eliminarTarea(){

    this.msgError = '';
   
       if(this.inputTareaEliminar === ''){
          alert('El campo de texto está vacio.  asegurese de seguir las instrucciones.');
          return;
       }
   
      if(this.tituloTareaEliminar !== this.inputTareaEliminar ) {
           alert('El texto ingresado en el campo no coincide.')
           return;
      }
      
      this.loading = true;

      this.dispositivoService.eliminarTarea(this.dispositivo._id, this.tareaIdEliminar)
      .subscribe((resp: any) => {
          if(resp.ok){
            alert('Tarea eliminada con éxito.');
            this.loading = false;
            this.tituloTareaEliminar = '';
            this.inputTareaEliminar = '';
            this.tareaIdEliminar = '';
            this.getTareas();
          }
          this.loading = false;
      }, (error: any) => {
           this.loading = false;
           this.msgError = error.error.msg;
      })


  }


  //DeviceAzure

  estadoDispositivo(){
     this.dispositivoService.estadoActualDispositivo(this.dispositivo._id)
     .subscribe((resp: any) => {

      if(resp.ok){
          this.volumen = resp.info.Volume;
          this.estadoActualDispositivo = resp.info

          this.buscarCancion(resp.info.PlayingSong, 'cs');
          this.buscarCancion(resp.info.NextSong, 'sc');
          this.buscarTarea(resp.info.ProgramNextEvent);
          

          console.log('Estado Local', this.estadoActualDispositivo);
         
      }
         
     })
  }



  private Prueba: any[] = [];
  private setInterval: any;


  actualizarEstadoCada10(){


    this.estadoDispositivo();
    this.spinnerService.hide()
      this.setInterval = setInterval(() => {
        this.spinnerService.hide()
     
          if(this.contador < 100 ){
              this.estadoDispositivo();       
          }             
          console.log(this.Prueba);
          this.spinnerService.hide() 
      },5000);
    
  }

  destruirSetInterval(){
    this.Prueba = [];
    this.contador = 0;
    clearInterval(this.setInterval);
  }

  ngOnDestroy(): void{
   this.destruirSetInterval();
  }


  buscarCancion(songId: string, value: string){

    console.log('buscando canción', songId, value);
     
    if(!songId ){
      return;
    }
    if(songId ==='None'){

      if(value === 'cs'){
              this.cancionSonando = 'No';
              return;
        }else if(value === 'sc'){
              this.siguienteCancion = 'No';
              return;
        }

    }

    let cortarExtencion = songId.split('.');

    this.cancionService.vercancion(cortarExtencion[0])
    .subscribe((resp: any) => {

      if(resp.ok){

          if(value === 'cs'){
                this.cancionSonando = resp.song.name;
          }else if(value === 'sc'){
                this.siguienteCancion = resp.song.name;
          }
          return;

      }

      if(resp.song !== ''){
        this.cancionSonando = resp.song;
      }else{
        this.cancionSonando = 'No';
      }
      
      this.siguienteCancion = 'No';

    });
     

  }

  buscarTarea(tareaNumber: number){

    if(!tareaNumber || tareaNumber < 1){
      return;
    }

    this.dispositivoService.buscarTareaNumero(this.dispositivo._id, tareaNumber)
    .subscribe((resp: any) => {
      if(resp.ok){
         
        if(resp.ok){
          this.siguienteEvento = resp.task.title
          this.fechaSiguienteEvento = 'inicia: '+ resp.task.startDate +' '+ resp.task.startHour+' -||- Finaliza: '+ resp.task.endDate +' '+ resp.task.endHour ; 
          return;
        }
        this.siguienteEvento = '';
        this.fechaSiguienteEvento = '';
        
      }
    }, (error: any) => {
      
        this.siguienteEvento = '';
        this.fechaSiguienteEvento = '';
    })


  }


  
  reproducirCancionEnDispositivo(cancion1: any){

    let cancion = cancion1.file;
    this.dispositivoService.comando(this.dispositivo._id, `playsong ${cancion}`)
    .subscribe((resp: any) => {       
      console.log(resp)  
      this.estadoDispositivo();   
    })
    // this.comando('mcp status ')  

  }

  reproducirPlayListEnDispositivo(){

    let playList = `${this.playListSeleccionada._id}.m3u`
    
    this.dispositivoService.comando(this.dispositivo._id, `playlist ${playList}`)
    .subscribe((resp: any) => { 
            console.log(resp);
            this.estadoDispositivo();
    
    })
    // this.comando('mcp status ') 
  }



  comandoNativoMpc(comando: string){ // play stop pausa random
    console.log('Entró comando', comando)
     this.dispositivoService.mpcComando(this.dispositivo?._id, `${comando}`)
     .subscribe((resp: any) => {
        if(resp.ok){
          console.log(resp);
          this.estadoDispositivo();
        }
     })
  }


  graduarVolumen(evento: any){
    if(!evento){
      return;
    }

    console.log(`mpc volume ${evento}%`);
    this.dispositivoService.mpcComando(this.dispositivo._id, `volume ${evento}`)
     .subscribe((resp: any) => {
       console.log(resp) 
     }, (err: any) => {console.log(err)})
  }

  horaSeleccionada(val: any) {
    console.log(val);
  }

  checkboxSeleccionado(value: any){
    if(value === 'shuffle' || value === 'repeat' || value === 'random') {}else{return;}

    if(value === 'shuffle' ){
         if(this.data.shuffle){
            this.data.shuffle = false
         }else{ this.data.shuffle = true }
    }

    if(value === 'repeat' ){
      if(this.data.repeat){
         this.data.repeat = false
      }else{ this.data.repeat = true }
    }

    if(value === 'random' ){
      if(this.data.random){
         this.data.random = false
      }else{ this.data.random = true }
    }
  }


  vaciarData(){

    this.data = {

      title: '',
      playList:'',
      description: '',
      startDate: '' ,
      startHour: '',
      endDate: '' ,
      endHour: '',
      shuffle: false,  // barajar
      repeat: false,
      random: false,
     
    }
    this.nombrePlayListForm = '';

  }

  noSpinner(){

  }


  sincronizarConDispositivo(playList: string){
    if(!playList){
      return
    }

    let playListId = playList;

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
