import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { ValidarRolService } from '../../../services/validar-rol.service';

@Component({
  selector: 'app-usuarios-admin',
  templateUrl: './usuarios-admin.component.html',
  styleUrls: ['./usuarios-admin.component.css']
})
export class UsuariosAdminComponent implements OnInit {

  

  usuariosEnLinea?: Observable<any>;

  userActivo = true;

  dataUsuario: any = {
    name:'',
    email:'',
    role: ''
  }

  buscadorUsuario = false;
  
  paginacion = {
    items: 14,
    pagina: 1,
    paginaTotal: 0,
    totalItems: 0, 
  }

  usuarios: any[] = [];

  btnAnt = true;
  btnSig = true;

  usuarioEditarID = ''
  actualizar = false;

  constructor(private usuarioService: UserService, private validarRol: ValidarRolService) {
      
   }

  ngOnInit(): void {
    
    this.usuariosEnLinea = this.usuarioService.usuariosEnLinea();
    this.usuarioService.emitirUsuariosActivos();
    
    this.getUsuarios(true);
  }

  getUsuarios(active: boolean) {
    this.buscadorUsuario = false;
    const paginacion = `?items=${this.paginacion.items}&page=${this.paginacion.pagina}&active=${active}`;
    this.usuarioService.getUsuarios(paginacion)
    .subscribe((resp: any) => {
     
         this.usuarios = resp.users;
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
    this.getUsuarios(this.userActivo);

  }

  paginaSiguiente(): any {

      if (this.paginacion.pagina < this.paginacion.paginaTotal) {

          this.paginacion.pagina ++;
          this.btnAnt = true;

      } else {

          this.btnSig = false;
          return;

      }
      this.getUsuarios(this.userActivo);

  }

  cambiarItem(item: string){
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
      this.getUsuarios(this.userActivo);
  }


  buscarUsuario(termino: string){
    console.log(termino)
    if(!termino){
      this.getUsuarios(this.userActivo);
      return;
    }
    this.buscadorUsuario = true;
    this.usuarioService.buscarUsuario(termino, this.userActivo)
    .subscribe((resp: any) => {
        if(resp.ok){
           this.usuarios = resp.users;
        }
        this.paginacion = {
          items: 14,
          pagina: 1,
          paginaTotal: 0,
          totalItems: 0, 
        }
    }, (error: any) => {
         console.log(error);
    } );
  }

  crearUsuario(){

    if(this.dataUsuario.name === '' || this.dataUsuario.email === '' || this.dataUsuario.role === ''){
       alert('Los datos son requeridos');
       return;
    }

    let emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    
    let Email = this.dataUsuario.email;
    let validacionEmail = emailRegex.test(Email);
     
    if(!validacionEmail){
      alert('El email es incorrecto');
      return;
    }

    this.usuarioService.crearUsuario(this.dataUsuario)
    .subscribe((resp: any) => {
        if(resp.ok){
           alert(resp.msg);
           this.dataUsuario = {
            name:'',
            email:'',
            role: ''
          }
           return;
        }
        this.getUsuarios(this.userActivo);
    }, (error: any) => alert(error.error.msg))
    

  }

  inhabilitarYHabilitarUsuario(uderID: string){
       this.usuarioService.deshabilitarYHabilitarUsuario(uderID)
       .subscribe((resp: any) => {
         
        if(resp.ok){
          alert(resp.msg);
          this.getUsuarios(this.userActivo);
          return
        }

       }, (err: any) => {
         alert(err.error.msg);
       })
  }


  cargarDataEnForm(user: any){
      if(!user){
        return;
      }
       
      this.actualizar = true;
      this.usuarioEditarID = user._id;      
      this.dataUsuario = {
          name: user.userName,
          email: user.email,
          role: user.role
      }
  }

  actualizarUsuario(){

    if(this.dataUsuario.name === '' || this.dataUsuario.email === '' || this.dataUsuario.role === '' || this.usuarioEditarID === ''){
      alert('Los datos son requeridos');
      return;
   }

   let emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
   
   let Email = this.dataUsuario.email;
   let validacionEmail = emailRegex.test(Email);
    
   if(!validacionEmail){
     alert('El email es incorrecto');
     return;
   }

   this.usuarioService.actualizarusuario(this.usuarioEditarID, this.dataUsuario)
   .subscribe((resp: any) => {
       if(resp.ok){
          alert(resp.msg);
          this.dataUsuario = {
           name:'',
           email:'',
           role: ''
         }
         this.usuarioEditarID = '';
         this.actualizar = false;
          return;
       }
       this.getUsuarios(this.userActivo);
   }, (error: any) => alert(error.error.msg))

  }

  

  verUserActivosYDeshabilitados(accion: boolean){


    this.userActivo = accion;
    this.getUsuarios(this.userActivo);
     
  }

}
