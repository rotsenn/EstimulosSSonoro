import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { FileUploadService } from '../../../services/file-upload.service';
import { AlertaService } from '../../../services/alerta.service';
import { CancionService } from '../../../services/cancion.service';
import { Router } from '@angular/router';
import { ReproductorService } from '../../../services/reproductor.service';
import { PlayListService } from '../../../services/play-list.service';
import { ValidarRolService } from '../../../services/validar-rol.service';

@Component({
  selector: 'app-canciones',
  templateUrl: './canciones.component.html',
  styleUrls: ['./canciones.component.css']
})
export class CancionesComponent implements OnInit {


  loading = false;
  msgLoading = '';

  nuevaCancion = false;
  editarCancion = false;
  subirCancion = false;
  idCancionEditar = '';


  msgError = ''
  msgExito = ''

  cancionFormGroup: FormGroup;
  cargando = false;

  canciones: any[] = [];

  cancionSubir: any;
  cancionSubirID = '';

  paginacion = { // paginacion cancion
    items: 15,
    pagina: 1,
    paginaTotal: 0,
    totalItems: 0, 
  }
  btnAnt = true;
  btnSig = true;

  addPlayList:any[] =[];
  cancionAddPlayList = '';

  generos:any[] = [];


  public imagenSubir?:any ; //:File
  public imgTemp: any = null;


  public cancionSubirF?:any ; //:File
  public duracionCancionSubirF: Number = 0;  // duracion de la cancion en segundos
  public cancionTemp: any = null;


  public album?: any;

  public playLists:any[] = [];
  paginacionPlayList = {
    items: 12,
    pagina: 1,
    paginaTotal: 0,
    totalItems: 0, 
  }
  btnAntPlayList = true;
  btnSigPlayList = true;

  buscadorCancion = false;  // cuando se hace una busqueda cambia a true para ocultar paginación

  nameCancionEliminar = '';
  inputcancionEliminar = '';
  idCancionEliminar = '';

  constructor(
              private FB: FormBuilder,
              private fileUploadService: FileUploadService,
              private alertaService: AlertaService,
              private cancionService: CancionService,
              private router: Router,
              public reproductor: ReproductorService,
              private playListServices: PlayListService,
              private validarRol: ValidarRolService
  ) { 
       this.cancionFormGroup = this.formGroupCancion();
  }

  ngOnInit(): void {
       
    this.getCanciones();
    this.getPlayLists();

  }


  getCanciones(){
    this.buscadorCancion = false;
    const paginacion = `?items=${this.paginacion.items}&page=${this.paginacion.pagina}`;
    this.cancionService.verCancioes(paginacion)
    .subscribe((resp: any) => {
        console.log('Así llega', resp);
         this.canciones = resp.songs;
         this.paginacion.paginaTotal = resp.total_pages;
         this.paginacion.totalItems = resp.total;

     });

  }

  

  formGroupCancion(): any {

      return this.cancionFormGroup = new FormGroup ({

        name: new FormControl('', [Validators.required]),
        duration: new FormControl(0, [Validators.required]),
        description: new FormControl('', [Validators.required]),
    
      });

  }


  crearCancion(){
      console.log('Crear')

      if (this.cancionFormGroup.invalid) {          
          this.msgError = 'Verifica que los campos estén diligenciados.';
          return;
      }

      this.cargando = true
      this.loading = true
      this.msgLoading = 'Enviando información...'

      this.cancionService.crearCancion(this.cancionFormGroup.value)
      .subscribe((resp: any) => {
         if(resp.ok){

              this.msgExito = resp.msg;   
              this.getCanciones(); 
              this.cargando = false
              this.msgLoading = ''
              this.loading = false
                           
              setTimeout(()=>{
                this.cancelarEdicion();
              },1000);

           return;
         
         }
         this.loading = false
         this.msgLoading = ''

      }, (err: any) => {
          this.msgError = err.error.msg;
          this.cargando = false
      });

  }


  buscarCancion(termino: string){
    if(!termino){
      this.getCanciones();
      return;
    }
    this.buscadorCancion = true;
    this.cancionService.buscarCancion(termino)
    .subscribe((resp: any) => {
        this.canciones = resp.songs;
        this.paginacion = { // paginacion cancion
          items: 15,
          pagina: 1,
          paginaTotal: 0,
          totalItems: 0, 
        }
    })
  }

  cancionSeleccionada(cancion: any){

  }

  editarCancionDb(){
      
      if (this.cancionFormGroup.invalid) {
          this.msgError = 'Verifica que los campos estén diligenciados.';
          return;
      }


      if(this.idCancionEditar === ''){
          this.msgError = 'No hay artista seleccionado.';
          return;
      }

      this.cargando = true
      this.loading = true
      this.msgLoading = 'Enviando información...'

      this.cancionService.ediatrCancion(this.idCancionEditar, this.cancionFormGroup.value)
      .subscribe((resp: any) => {
        if(resp.ok){
              this.msgExito = 'Canción actualizada con éxito'
              this.getCanciones();
              this.loading = false;
              this.msgLoading = ''
              setTimeout(() => {
                 this.cancelarEdicion();
              }, 2000)
         
        }
      }, (err: any) => {
          this.msgError = err.error.msg;
          this.cargando = false;
          this.loading = false;
          this.msgLoading = '';
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
      this.getCanciones();

  }

  paginaSiguiente(): any {

      if (this.paginacion.pagina < this.paginacion.paginaTotal) {

          this.paginacion.pagina ++;
          this.btnAnt = true;

      } else {

          this.btnSig = false;
          return;

      }
      this.getCanciones();

  }


  albumDetalle(id: string){
    this.router.navigateByUrl(`/admin/album/${id}`);
  }


  actualizarCancionForm(id: string){


      let cancion = this.canciones.find(canciones => canciones._id === id);

      if(!cancion){
          this.idCancionEditar = '';
          this.alertaService.alertaError('No se pudo seleccionar la canción.');
          return;
      }

      this.cancionFormGroup.controls.name.setValue(cancion.name);
      this.cancionFormGroup.controls.duration.setValue(cancion.duration);
      this.cancionFormGroup.controls.description.setValue(cancion.description);
      this.idCancionEditar = id;

      this.nuevaCancion = false;
      this.subirCancion = false;
      this.editarCancion = true;
  }

  cancelarEdicion(){
    this.formGroupCancion();
    this.subirCancion = false;
    this.nuevaCancion = false;
    this.editarCancion = false;
    this.idCancionEditar = '';
    this.msgError = '';
    this.msgExito = '';
    this.cargando = false
    this.cancionTemp = null;
  }





  // CambiarImg

  cambiarImagen( file: any ): any {

      this.imagenSubir = file.files[0];

      if ( !file.files[0] ) { 
        return this.imgTemp = null;
      }
      
      const reader = new FileReader();
      reader.readAsDataURL( file.files[0] );

      reader.onloadend = () => {
        this.imgTemp = reader.result;
      }

  }


  subirImagen() {
    
    this.fileUploadService
      .actualizarFoto( this.imagenSubir, 'playListsIMG', this.album?._id  )
      .then( img => {
        this.album.img = img;  // actualizar img
        this.alertaService.alertaExito('Imagen del album actualizada');
      }).catch( err => {
        console.log(err);
        this.alertaService.alertaError('No se pudo subir la imagen');
      })

  }


  cambiarCancion( file: any ): any {

     
      this.cancionSubirF = file.files[0];

      if ( !file.files[0] ) { 
        return this.cancionTemp = null;
      }
      
      let reader = new FileReader();
      reader.readAsDataURL( file.files[0] );

      reader.onloadend = (e: any) => {
        var audio: any = document.createElement('audio');
        audio.src = e.target.result;
        audio.addEventListener('loadedmetadata', () => {
            // Duración en segundos del archivo de audio (con milisegundos también, un valor flotante)
            var duration = audio.duration;
        
            // console.log("La duración de la canción es de: " + duration + " seconds"); 
            // Alternativamente, simplemente muestre el valor entero con
            
            this.duracionCancionSubirF = parseInt(duration);
            console.log ('entero local', this.duracionCancionSubirF);
            // 12 seconds
        },false);

        this.cancionTemp = reader.result;
      }

  }


  subirCancionFile() {

    this.loading = true
    this.msgLoading = 'Subiendo canción...'
    
    this.fileUploadService
      .actualizarCancion( this.cancionSubirF,this.cancionSubirID, this.duracionCancionSubirF )
      .then( (cancion: any) => {

        console.log('La respuesta', cancion);
      
         if(cancion.ok){        

            this.getCanciones();         
            this.msgExito = 'Canción subida con éxito.';         
            this.msgError = ''
            this.loading = false
            this.msgLoading = ''

            setTimeout(()=>{
              this.cancelarEdicion();
            },2000)
         
         }else{
           this.msgError = cancion.msg;
           this.msgExito = '';
           this.loading = true;
           this.msgLoading = '';
           return
         }

      }).catch( err => {
        console.log('EL ERROR', err);
        this.alertaService.alertaError('No se pudo subir la cancion');
      })

  }

  

  adjuntarCancion(cancionID: string) {
   
     let cancion = this.canciones.find(canciones => canciones._id === cancionID);
      if(!cancion){
        return
      }
      this.cancionSubir = cancion;
      this.cancionSubirID = cancionID;

      this.cancelarEdicion();
      this.nuevaCancion = false;
      this.editarCancion = false;
      this.subirCancion = true;
  }



  startPlayer(song: any){

      let reproduccionAnterior = this.canciones.find(resp => resp.rp === true );
      let reproducir = this.canciones.find(resp => resp._id === song._id );
      

      let song_player = JSON.stringify(song);

      let filePath = `${environment.base_url_do}/v1/upload/songs/${song.file}`

      localStorage.setItem('cancion_sonando', song_player );
      document.getElementById("mp3-source")?.setAttribute("src", filePath);

      (document.getElementById("player") as any).load();

      if(!reproducir.rp){

        console.log('Play');

          (document.getElementById("player") as any).play();
           reproducir.rp = true;
           if(reproduccionAnterior){
             reproduccionAnterior.rp = false;
           }
           

      }else{

        console.log('pause');

          (document.getElementById("player") as any).pause();
          reproducir.rp = false;
          reproduccionAnterior.rp = false;
      }
      

      //@ts-ignore
      document.getElementById("play-song-title").innerHTML =  '<i class="icon-music-tone"></i>'+song.name;



    
  }



  getPlayLists(){
    const paginacion = `?items=${this.paginacionPlayList.items}&page=${this.paginacionPlayList.pagina}`;
    this.playListServices.verPlayLists(paginacion)
    .subscribe((resp: any) => {    
      console.log(resp);  
         this.playLists = resp.playlists;
         this.paginacionPlayList.paginaTotal = resp.total_pages;
         this.paginacionPlayList.totalItems = resp.total;
     });

  }

  paginaAnteriorPlayList(): any {
    if (this.paginacionPlayList.pagina > 1) {
        this.paginacionPlayList.pagina --;
        this.btnSigPlayList = true;
    }else {
        this.btnAntPlayList = false;
        return;
    }
    this.getPlayLists();
  }

  paginaSiguientePlayList(): any {
      if (this.paginacionPlayList.pagina < this.paginacion.paginaTotal) {
          this.paginacionPlayList.pagina ++;
          this.btnAntPlayList = true;
      } else {
          this.btnSig = false;
          return;
      }
      this.getPlayLists();
  }


  playListSeleccionada(playListId: string){

    let data = {
      playList: ''
    } 

    const existePlayList = this.addPlayList.find(resp => resp.playList === playListId );
     if(existePlayList){
       this.addPlayList = this.addPlayList.filter(resp => resp.playList !== playListId );
       console.log(this.addPlayList);
       return;
     }

     data.playList = playListId;
     this.addPlayList.push(data);

     console.log(this.addPlayList);
       
  }

  guardarCancionesEnPlayList(){

    if(this.cancionAddPlayList.length < 1){
      this.alertaService.alertaError('No hay PlayList seleccionada')
      return;
    }

    this.cancionService.guardarCancionEnPlayLists(this.cancionAddPlayList, this.addPlayList)
    .subscribe((resp: any) => {

      if(resp.ok){
         this.getPlayLists();
      }
          console.log(resp);
    });

  }

  cambiarItemCancion(item: string){
    if(item === ""){
      return;
    }

    this.  paginacion = { // paginacion cancion
      items: 15,
      pagina: 1,
      paginaTotal: 0,
      totalItems: 0, 
    }

    console.log(item)
      this.paginacion.items = Number(item);
      this.getCanciones();
  }



  eliminarCancion(){

    if(this.idCancionEliminar === '' || this.nameCancionEliminar === ''){
          alert('Por favor vuelve a seleccionar la canción');
          return;
    }
    
    if(this.inputcancionEliminar === ''){
          alert('El campo de texto es requerido.');
          return;
    }

    if(this.inputcancionEliminar !== this.nameCancionEliminar){
        alert('Los datos del campo de texto no coinciden con el nombre de la canción, por favor siga las instrucciones.');
        return;
    }

    this.loading = true;

    this.cancionService.EliminarCancion(this.idCancionEliminar)
    .subscribe((resp: any) => {

      if(resp.ok){
          this.loading = false;
          this.getCanciones();
          this.getPlayLists();
          alert(resp.msg);
          return;
      }

    }, (err: any) => {
          this.loading = false
          alert(err.error.msg);
    });

  }





}
