import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AlertaService } from '../../services/alerta.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public logueo = true
  
  public emailRc = '';
  public email = '';
  public password = '';
  public val?: string;
  public valRc?: string;

  public cargando = false;

  public error = false;
  public msgError?: string;

  constructor(private authService: AuthService, private router: Router, private alertaService: AlertaService, private userService: UserService) { }

  ngOnInit(): void {
    this.validateLocalStorage();
  }


  login(): any{    

      if (this.val) {
        return;
      }
      if (!this.email){

            this.error = true;
            this.msgError = 'El Email es requerido';
            return;

      }
      if (!this.password){
          this.error = true;
          this.msgError = 'El Password es requerido';
          return;
      }

      const data = {
        email: this.email,
        password: this.password,
      };

      this.authService.login(data)
      .subscribe((resp: any) => {

          if (resp.ok) {
                this.authService.createToken(resp.token);
                this.userService.emitirUsuariosActivos();
                this.router.navigateByUrl('/admin/interface/dispositivos');
          }

      }, (err: any) => {

          if (err.status !== 500){

              this.error = true;
              this.msgError = err.error.msg;
              return;

          }
          this.error = true;
          this.msgError = 'Error inesperado...  Intentalo nuevamente';
          return;

      });


  }


  RecuperarPass(): any{

    console.log('RecuperarPass', this.emailRc);

      if(!this.emailRc){
        return false;
      }

      this.alertaService.cargando();

      let emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      
      console.log('Será valido? ', this.emailRc.match(emailRegex));

      if(!this.emailRc.match(emailRegex)){
         this.alertaService.alertaError('No es un email válido.');
         return;
      }

      this.authService.recuperarPass(this.emailRc)
      .subscribe((resp: any) => {
        if(resp.ok){
           this.alertaService.alertaExito(resp.msg)
           this.emailRc = '';
           this.logueo = true;
        }

      }, (err: any) => {

         this.alertaService.alertaError(err.error)

      });
    
  }


  validateLocalStorage(): any {


    if (localStorage.getItem('x-token')) {

          this.router.navigateByUrl('/admin/interface/dispositivos');
          // location.href = "http://localhost:4200/#/"
    }

  }
  

}
