import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertaService } from '../../services/alerta.service';

@Component({
  selector: 'app-recuperar-password',
  templateUrl: './recuperar-password.component.html',
  styleUrls: ['./recuperar-password.component.css']
})
export class RecuperarPasswordComponent implements OnInit {

  public tokenValido = false;
  public tokenInvalido = false;
  token = '';

  password1 = '';
  password2 = '';
  val = '';

  error = false;
  msgError = '';

  constructor(private activareRoute: ActivatedRoute, private authService: AuthService, private alertaService: AlertaService, private router: Router) { }

  ngOnInit(): void {
    this.activareRoute.params.subscribe((params: Params) => {

         this.token = params.token;
         this.validarToken(this.token);

    });
  }

  validarToken(token: string){
    this.alertaService.cargando();
    this.authService.validarTokenDeRecuperacion(token)
    .subscribe((resp: any) => {
         if(resp.ok){
             this.tokenValido = true;
             this.alertaService.cerrarCargando();
         }
    }, (error: any )=> {

      this.tokenValido = false;
      this.tokenInvalido = true;
      this.alertaService.cerrarCargando();
         
    });

  }


  crearPassword(){


    if(this.password1 === ''  || this.password2 === ''){
      this.alertaService.alertaError('Los datos son requeridos.');
      return;
    }
    if(this.password1 !== this.password2){
      this.alertaService.alertaError('La contraseña de verificación no coincide.');
      return;
    }

    this.alertaService.cargando();

    let data = {
      password1: this.password1,
      password2: this.password2
    }

    this.authService.cambiarContraseñaRecuperacion(this.token,data)
    .subscribe((resp: any) => {
        if(resp.ok){
             this.alertaService.alertaExito(resp.msg);
             this.router.navigateByUrl('/login');
        }
    }, (error: any) => {
          this.alertaService.alertaError(error.error.msg);
    })

  }

}
