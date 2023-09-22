import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertaService } from '../../../services/alerta.service';
import { Router } from '@angular/router';
import { ReproductorService } from '../../../services/reproductor.service';
import { DispositivoService } from '../../../services/dispositivo.service';
import { ValidarRolService } from '../../../services/validar-rol.service';

@Component({
  selector: 'app-dispositivos',
  templateUrl: './dispositivos.component.html',
  styleUrls: ['./dispositivos.component.css']
})
export class DispositivosComponent implements OnInit {




  nuevoDispositivo = false;
  editarDispositivo = false;
    
  idDispositivoEditar = '';


  msgError = ''
  msgExito = ''

  dispositivoFormGroup: FormGroup;
  cargando = false;

  dispositivos: any[] = [];

  dispositivoSubir: any;
  dispositivoSubirID = '';

  paginacion = {
    items: 14,
    pagina: 1,
    paginaTotal: 0,
    totalItems: 0, 
  }

  btnAnt = true;
  btnSig = true;

  inputDispositivoEliminar = ''
  nameDispositivoEliminar = ''
  dispositivoEliminarId = '';

  buscadorDispositivo = false;



  public playList?: any;

  constructor(
              // private FB: FormBuilder,
              private alertaService: AlertaService,
              private dispositivoService: DispositivoService,
              private router: Router,
              public reproductor: ReproductorService,
              private validarRol: ValidarRolService
  ) { 
       this.dispositivoFormGroup = this.formGroupPlayList();
  }

  ngOnInit(): void {
       
    this.getDispositivo();

  }


  getDispositivo(){
    this.buscadorDispositivo = false;
    const paginacion = `?items=${this.paginacion.items}&page=${this.paginacion.pagina}`;
    this.dispositivoService.verDispositivos(paginacion)
    .subscribe((resp: any) => {      
         this.dispositivos = resp.device;
         this.paginacion.paginaTotal = resp.total_pages;
         this.paginacion.totalItems = resp.total;
     });

  } 

  
  formGroupPlayList(): any {

      return this.dispositivoFormGroup = new FormGroup ({

        name: new FormControl('', [Validators.required]),
        identifier: new FormControl('', [Validators.required]),
        location: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
    
      });

  }


  crearDispositivo(){
      console.log('Crear')

      if (this.dispositivoFormGroup.invalid) {          
          this.msgError = 'Verifica que los campos estén diligenciados.';
          return;
      }

      this.cargando = true

      this.dispositivoService.crearDispositivo(this.dispositivoFormGroup.value)
      .subscribe((resp: any) => {
         if(resp.ok){

              this.msgExito = resp.msg;   
              this.getDispositivo(); 
              
              setTimeout(()=>{
                this.cancelarEdicion();                
              },1000);   

         }
      }, (err: any) => {
          this.msgError = err.error.msg;
          this.cargando = false
      });

  }


  buscarDispositivo(termino: string){
   console.log(termino)
    if(!termino){
       this.getDispositivo()
       return;
    }
    this.buscadorDispositivo = true;

    this.dispositivoService.buscarDispositivo(termino)
    .subscribe((resp: any) => {      
         this.dispositivos = resp.devices;
         this.paginacion = {
          items: 14,
          pagina: 1,
          paginaTotal: 0,
          totalItems: 0, 
        }
     });

  }




  editarDispositivoDb(){
      
      if (this.dispositivoFormGroup.invalid) {
          this.msgError = 'Verifica que los campos estén diligenciados.';
          return;
      }


      if(this.idDispositivoEditar === ''){
          this.msgError = 'No hay artista seleccionado.';
          return;
      }

      this.cargando = true

      this.dispositivoService.editarDispositivo(this.idDispositivoEditar, this.dispositivoFormGroup.value)
      .subscribe((resp: any) => {
        if(resp.ok){
              this.msgExito = 'PlayList actualizado con éxito'
              this.getDispositivo();
              setTimeout(() => {
                 this.cancelarEdicion();
              }, 2000)
         
        }
      }, (err: any) => {
          this.msgError = err.error.msg;
          this.cargando = false
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
      this.getDispositivo();

  }

  paginaSiguiente(): any {

      if (this.paginacion.pagina < this.paginacion.paginaTotal) {

          this.paginacion.pagina ++;
          this.btnAnt = true;

      } else {

          this.btnSig = false;
          return;

      }
      this.getDispositivo();

  }


  dispositivoDetalle(id: string){
    this.router.navigateByUrl(`/admin/playList/${id}`);
  }


  actualizarDispositivoForm(id: string){

      let dispositivo = this.dispositivos.find(dispositivos => dispositivos._id === id);

      if(!dispositivo){
          this.idDispositivoEditar = '';
          this.alertaService.alertaError('No se pudo seleccionar la canción.');
          return;
      }

      this.dispositivoFormGroup.controls.name.setValue(dispositivo.name);
      this.dispositivoFormGroup.controls.identifier.setValue(dispositivo.identifier);
      this.dispositivoFormGroup.controls.location.setValue(dispositivo.location);
      this.dispositivoFormGroup.controls.description.setValue(dispositivo.description);
      this.idDispositivoEditar = id;

      this.nuevoDispositivo = false;
      this.editarDispositivo = true;
  }

  cancelarEdicion(){
    this.formGroupPlayList();
    this.nuevoDispositivo = false;
    this.editarDispositivo = false;
    this.idDispositivoEditar = '';
    this.msgError = '';
    this.msgExito = '';
    this.cargando = false
  }


  eliminarDispositivo(){
    if(this.inputDispositivoEliminar === ''){
        alert('Diligencie el campo de confirmación.');
        return
    }

    if(this.inputDispositivoEliminar !== this.nameDispositivoEliminar) {
        alert('Verifique que el dato ingresado en el campo de texto sea igual al descrito.');
        return;
    }

    this.dispositivoService.eliminarDispositivo(this.dispositivoEliminarId)
    .subscribe((resp: any) => {
       if(resp.ok){
         this.getDispositivo();
         alert(resp.msg)
       }
    }, (error: any) => alert(error.error.msg));


     console.log(this.dispositivoEliminarId);
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
      this.getDispositivo();
  }



}
