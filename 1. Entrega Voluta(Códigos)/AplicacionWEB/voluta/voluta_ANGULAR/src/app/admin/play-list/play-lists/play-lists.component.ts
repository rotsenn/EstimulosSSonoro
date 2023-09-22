import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { FileUploadService } from '../../../services/file-upload.service';
import { AlertaService } from '../../../services/alerta.service';
import { CancionService } from '../../../services/cancion.service';
import { Router } from '@angular/router';
import { ReproductorService } from '../../../services/reproductor.service';
import { PlayListService } from '../../../services/play-list.service';
import { ValidarRolService } from '../../../services/validar-rol.service';

@Component({
  selector: 'app-play-lists',
  templateUrl: './play-lists.component.html',
  styleUrls: ['./play-lists.component.css']
})
export class PlayListsComponent implements OnInit {


  loading = false;
  msgLoading = '';


  nuevaPlayList = false;
  editarPlayList = false;
  subirPlayList = false;
  idPlayListEditar = '';


  msgError = ''
  msgExito = ''

  playListFormGroup: FormGroup;
  cargando = false;

  playLists: any[] = [];

  playListSubir: any;
  playListSubirID = '';

  paginacion = {
    items: 14,
    pagina: 1,
    paginaTotal: 0,
    totalItems: 0, 
  }
  btnAnt = true;
  btnSig = true;

  generos:any[] = [];

  cancionesPlayList :any[] = [];
  NombrePlayListCanciones=''; // Nombre de la playList seleccionada para ver sus canciones


  public imagenSubir?:any ; //:File
  public imgTemp: any = null;


  public playListSubirF?:any ; //:File
  public playListTemp: any = null;

  public playList?: any;

  playListEliminarId = '';
  namePlayListEliminar = '';
  inputPlayListEliminar = '';

  buscadorPlayList = false;

  constructor(
              private FB: FormBuilder,
              private fileUploadService: FileUploadService,
              private alertaService: AlertaService,
              private playListService: PlayListService,
              private router: Router,
              public reproductor: ReproductorService,
              private validarRol: ValidarRolService
  ) { 
       this.playListFormGroup = this.formGroupPlayList();
  }

  ngOnInit(): void {
       
    this.getPlayList();

  }


  getPlayList(){
    this.buscadorPlayList = false;
    const paginacion = `?items=${this.paginacion.items}&page=${this.paginacion.pagina}`;
    this.playListService.verPlayLists(paginacion)
    .subscribe((resp: any) => {      
         this.playLists = resp.playlists;
         this.paginacion.paginaTotal = resp.total_pages;
         this.paginacion.totalItems = resp.total;
     });

  }

  
  formGroupPlayList(): any {

      return this.playListFormGroup = new FormGroup ({

        name: new FormControl('', [Validators.required]),
        type: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
    
      });

  }


  crearPlayList(){
      

      if (this.playListFormGroup.invalid) {          
          this.msgError = 'Verifica que los campos estén diligenciados.';
          return;
      }

      this.cargando = true
      this.loading = true;
      this.msgLoading = 'Enviando datos...';

      this.playListService.crearPlayList(this.playListFormGroup.value)
      .subscribe((resp: any) => {
         if(resp.ok){

              this.msgExito = resp.msg;   
              this.getPlayList(); 
              this.loading = true;
              this.msgLoading = '';
              
              setTimeout(()=>{
                this.cancelarEdicion();                
              },1000);   

         }
      }, (err: any) => {
          this.msgError = err.error.msg;
          this.cargando = false
          this.loading = false;
          this.msgLoading = '';
      });

  }


  buscarCancion(cancion: any){

  }

  buscarPlayList(termino: string){

    if(!termino){
       this.getPlayList();
       return;
    }
    this.buscadorPlayList = true;

    this.playListService.buscarPlayList(termino)
    .subscribe((resp: any) => {      
         this.playLists = resp.playLists;
         this.paginacion = {
            items: 14,
            pagina: 1,
            paginaTotal: 0,
            totalItems: 0, 
         }
     });
  }

  cancionSeleccionada(cancion: any){

  }

  editarPlayListDb(){
      
      if (this.playListFormGroup.invalid) {
          this.msgError = 'Verifica que los campos estén diligenciados.';
          return;
      }


      if(this.idPlayListEditar === ''){
          this.msgError = 'No hay artista seleccionado.';
          return;
      }

      
      this.cargando = true
      this.loading = true;
      this.msgLoading = 'Enviando datos...';

      this.playListService.editarPlayList(this.idPlayListEditar, this.playListFormGroup.value)
      .subscribe((resp: any) => {
        if(resp.ok){
              this.msgExito = 'PlayList actualizado con éxito'
              this.getPlayList();
              this.loading = false;
              this.msgLoading = '';
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


  playListDetalle(id: string){
    this.router.navigateByUrl(`/admin/playList/${id}`);
  }


  actualizarPlayListForm(id: string){

      let cancion = this.playLists.find(canciones => canciones._id === id);

      if(!cancion){
          this.idPlayListEditar = '';
          this.alertaService.alertaError('No se pudo seleccionar la canción.');
          return;
      }

      this.playListFormGroup.controls.name.setValue(cancion.name);
      this.playListFormGroup.controls.type.setValue(cancion.type);
      this.playListFormGroup.controls.description.setValue(cancion.description);
      this.idPlayListEditar = id;

      this.nuevaPlayList = false;
      this.subirPlayList = false;
      this.editarPlayList = true;
  }

  cancelarEdicion(){
    this.formGroupPlayList();
    this.subirPlayList = false;
    this.nuevaPlayList = false;
    this.editarPlayList = false;
    this.idPlayListEditar = '';
    this.msgError = '';
    this.msgExito = '';
    this.cargando = false
    this.playListTemp = null;
  }





  // CambiarImg

  cambiarImagen( file: any ): any {

      this.imagenSubir = file.files[0];

      console.log('Imagen a subir', this.imagenSubir);

      if ( !file.files[0] ) { 
        return this.playListTemp = null;
      }
      
      const reader = new FileReader();
      reader.readAsDataURL( file.files[0] );

      reader.onloadend = () => {
        this.playListTemp = reader.result;
      }

  }


  subirImagen() {

    this.loading = true;
    this.msgLoading = 'Subiendo imagen...';

    this.fileUploadService
      .actualizarFoto( this.imagenSubir, 'playListsIMG', this.playListSubirID  )
      .then( (img: any) => {
               
        // this.playList.img = img.nameSong;  // actualizar img 
        this.msgExito="";  
        this.getPlayList();
        alert('Imagen subida con éxito');        
        this.loading = false;
        this.msgLoading = '';
        this.nuevaPlayList = false;
        this.subirPlayList = false;
        this.editarPlayList = false;
        
        return;
      }).catch( err => {
        console.log(err);
        this.alertaService.alertaError('No se pudo subir la imagen');
      })

  }


  cambiarImagenPlayList( file: any ): any {

      this.playListSubirF = file.files[0];

      if ( !file.files[0] ) { 
        return this.playListTemp = null;
      }
      
      const reader = new FileReader();
      reader.readAsDataURL( file.files[0] );

      reader.onloadend = () => {
        this.playListTemp = reader.result;
      }

  }


  subirImagenPlayList() {

    this.loading = true;
    this.msgLoading = 'Subiendo imagen...';
    
    this.fileUploadService
      .actualizarFoto( this.playListSubirF,'playListsIMG',this.playListSubirID )
      .then( (playList: any) => {
      
         if(playList.ok){        

            this.getPlayList();         
            this.msgExito = 'Imagen subida con exito.';         
            this.msgError = '';
            this.loading = false;
            this.msgLoading = '';

            setTimeout(()=>{
              this.cancelarEdicion();
            },2000)
         
         }else{

           this.msgError = playList.msg
           this.msgExito = ''
           return
         }

      }).catch( err => {
        console.log(err);
        this.alertaService.alertaError('No se pudo subir la Imagen');
      })

  }

  

  adjuntarPlayList(playListID: string) { 

     let playList = this.playLists.find(playLists => playLists._id === playListID);
      if(!playList){
        return
      }

      this.playListSubir = playList;
      this.playListSubirID = playListID;

      this.cancelarEdicion();
      this.nuevaPlayList = false;
      this.editarPlayList = false;
      this.subirPlayList = true;
  }





  startPlayer(song: any){

    let reproduccionAnterior = this.cancionesPlayList.find(resp => resp.song.rp === true ); 

    let reproducir = this.cancionesPlayList.find(resp => resp.song._id === song._id );
   

   let song_player = JSON.stringify(song);

   let filePath = `${environment.base_url_do}/v1/upload/songs/${song.file}`

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
   document.getElementById("play-song-title").innerHTML =  '<i class="icon-music-tone"></i>'+song.name;



 
}

  verCancionesPlayList(playListId: string) {
    console.log('Vercanciones')

      this.cancionesPlayList = []; 
      let playList = this.playLists.find(playListt => playListt._id === playListId);
      console.log(playList);
        if(!playList){
          return
        }
      this.cancionesPlayList = playList.songs;
      this.NombrePlayListCanciones = playList.name;

  }


  eliminarPlayList(){
    if(this.inputPlayListEliminar === ''){
      alert('Diligencie el campo de confirmación.');
      return
    }

    if(this.inputPlayListEliminar !== this.namePlayListEliminar) {
        alert('Verifique que el dato ingresado en el campo de texto sea igual al descrito.');
        return;
    }

    this.loading = true;

    this.playListService.eliminarPlayListDeDispositivos(this.playListEliminarId)
    .subscribe((resp: any) => {

          alert(resp.msg);
          this.getPlayList();
          this.loading = false;

    }, (err: any) => {
       this.loading = false;
       alert(err.error.msg)
    })
    
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
      this.paginacion.items = Number(item);
      this.getPlayList();
  }

}
