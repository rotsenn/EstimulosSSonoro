import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private urlService: UrlService,
    private router: Router ) { }

    login(data: object): any {
      return this.urlService.postQuery('login', data);
    }

    logout(): void {
      localStorage.removeItem('x-token');
      this.router.navigateByUrl('/login');
    }

    createToken(token: string): any{
        localStorage.setItem('x-token', token);
    }

    recuperarPass(email: string){
       return this.urlService.postQuery(`password-reset`,{email});
    }

    validarTokenDeRecuperacion(token: string){
      return this.urlService.getQuery(`validar-tk-crear-password?token=${token}`);
    }

    cambiarContraseñaRecuperacion(token: string, data: Object){
      return this.urlService.putQuery(`new-password?token=${token}`, data);
    }

    validarEmailActivarCuenta(token: string){
       return  this.urlService.getQuery(`validate-account?token=${token}`);
    }
    
}
