import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AlertaService } from '../../services/alerta.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-validar-email',
  templateUrl: './validar-email.component.html',
  styleUrls: ['./validar-email.component.css']
})
export class ValidarEmailComponent implements OnInit {

  constructor(private router: Router, private alertaService: AlertaService, private authService: AuthService, private activareRoute: ActivatedRoute) { }

  ngOnInit(): void {

      this.activareRoute.params.subscribe((params: Params) => {

        this.validarToken(params.token);

      });
  }



  validarToken(token: string){
    this.alertaService.cargando();
    this.authService.validarEmailActivarCuenta(token)
    .subscribe((resp: any) => {
         if(resp.ok){
             this.alertaService.cerrarCargando();
             alert(resp.msg);
             setTimeout(()=>{
               this.router.navigateByUrl('/login')
             },100)
         }
    }, (error: any )=> {

      console.log(error);
      alert(error.error.msg);
      this.router.navigateByUrl('/login')
      // this.tokenValido = false;
      // this.tokenInvalido = true;
      this.alertaService.cerrarCargando();
         
    });

  }

}
