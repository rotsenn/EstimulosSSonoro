import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router, CanLoad, Route, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import {tap} from 'rxjs/operators';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate, CanLoad {
  constructor(private user: UserService,
    private router: Router){}
  canLoad(route: Route, segments: UrlSegment[]): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.user.validarToken()
    .pipe(
      tap(estaAutenticado => {
        if (!estaAutenticado){
        this.router.navigateByUrl('/nbedoya/login');
        }
      })
    );
  }


canActivate(
route: ActivatedRouteSnapshot,
state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

  return this.user.validarToken()
      .pipe(
          tap(estaAutenticado => {

              if (!estaAutenticado){
                this.router.navigateByUrl('/login');
              }

          })
      );

  }
  
}
