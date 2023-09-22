import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { UserModel } from '../../../models/userModel';
import { FileUploadService } from '../../../services/file-upload.service';

@Component({
  selector: 'app-usuario-config',
  templateUrl: './usuario-config.component.html',
  styleUrls: ['./usuario-config.component.css']
})
export class UsuarioConfigComponent implements OnInit {

  dataCambiPass = {
    passActual: '',
    passNuevo: '',
    passValidacion:''

  }

  nombre: any = ''
  nombreActualizar = '';
  idUsuario: any = '';
  img: any;
  rol: any;

  public imagenSubir?:any ; //:File
  public imagenTemp: any = null;

  constructor(private userService: UserService, private fileUploadService: FileUploadService) { 
      this.rol = userService.user?.role;
      this.nombre = userService.user?.userName;
      this.idUsuario = userService.user?.id;
      this.img = userService.user?.img;
  }

  ngOnInit(): void {

  }

  cambiarPassword(){
    
    if( this.dataCambiPass.passActual === '' || this.dataCambiPass.passNuevo === '' || this.dataCambiPass.passValidacion === ''){
      alert('Los datos son requeridos');
      return;
    }

    if(this.dataCambiPass.passNuevo !== this.dataCambiPass.passValidacion ){
      alert('Las contraseñas deben coincidir');
      return;
    }


     this.userService.actualizarPassword(this.dataCambiPass)
     .subscribe((resp: any) => {

      if(resp.ok){
        alert(resp.msg);
        this.  dataCambiPass = {
          passActual: '',
          passNuevo: '',
          passValidacion:''      
        }
        return;
      }

     }, (error: any)=> alert(error.error.msg))

     
  }

  actualizarNombre(){

   
    if(this.nombreActualizar === ''){
      alert('el nombre de usuario es requerido');
      return;
    }

    if(this.idUsuario === ''){
      return;
    }

    this.userService.actualizarNombreDeUsuario(this.idUsuario, this.nombreActualizar)
    .subscribe((resp: any) => {
       if(resp.ok){
         this.nombre = resp.user.userName;
         this.nombreActualizar = '';
         alert(resp.msg);        
         return;
       }
    }, (error: any)=> alert(error.error.msg))


  }



  cambiarImagenUsuario( file: any ): any {

    this.imagenSubir = file.files[0];

    if ( !file.files[0] ) { 
      return this.imagenTemp = null;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL( file.files[0] );

    reader.onloadend = () => {
      this.imagenTemp = reader.result;
    }

    
    this.subirImagenUsuario();
    

}


subirImagenUsuario() {
  
  this.fileUploadService
    .actualizarFoto( this.imagenSubir,'users',this.idUsuario )
    .then( (resp: any) => {
    
       if(resp.ok){        
         
         this.userService.user?.setImg(this.imagenTemp);
   
          
       }

    }).catch( err => {
      console.log(err);
      alert('No se pudo subir la Imagen');
    })

}

}
