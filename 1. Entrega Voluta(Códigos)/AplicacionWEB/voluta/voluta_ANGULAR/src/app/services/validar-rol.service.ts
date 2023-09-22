import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ValidarRolService {

  constructor(private userService: UserService, private router: Router) { 
    this.validarRoleAdmin();
  }

  validarRoleAdmin(){
     if(this.userService.user?.role === 'ADMIN_ROLE' || this.userService.user?.role === 'SUPER_ROLE' ){}else{
      localStorage.removeItem('x-token');
      this.router.navigateByUrl('/login');
     }
  }



}
