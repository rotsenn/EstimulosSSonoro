import { Injectable } from '@angular/core';
import { tap,  map, catchError} from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { UserModel } from '../models/userModel';
import { UrlService } from './url.service';
import { WebsocketService, UsuarioI } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

    public user?: UserModel;

    constructor(private urlService: UrlService, private wsService: WebsocketService) { }


    getUsuarios(query: string){
      return this.urlService.getQuery(`users${query}`)
    }

    crearUsuario(data: Object){
      return this.urlService.postQuery('user',data);
    }

    buscarUsuario(termino: string, activo: boolean){
      return this.urlService.getQuery(`search-users/${termino}?active=${activo}`);
    }

    actualizarusuario(userID: string, data: Object){
      return this.urlService.putQuery(`user/${userID}`, data);
    }

    deshabilitarYHabilitarUsuario(userID: string){
      return this.urlService.putQuery(`disable-enable-user`, {userID});
    }

    actualizarPassword(data:Object){
      return this.urlService.postQuery('changePassword',data);
    }

    actualizarNombreDeUsuario(userId: any, name: any){
      return this.urlService.putQuery(`update-user-name/${userId}`, {name});
    }

    usuariosEnLinea(){ // conectar uasuario 
      return this.wsService.listen('user-connected');    
    } 

    renovarToken(){
      const token = localStorage.getItem('x-token') || '';
      return this.urlService.getValidateToken('renew', token);
    }

    emitirUsuariosActivos(){ // obtener lista de usuarios activos
      return this.wsService.emmit('get-users');
    }

    ingresar(){
      let user: any = {
        id: this.user?.id,
        name: this.user?.userName,
        role: this.user?.role,
        img: this.user?.img,
      }
        this.wsService.loginUser(user)
    }




    validarToken(): Observable<boolean>{

        const token = localStorage.getItem('x-token') || '';
        return this.urlService.getValidateToken('renew', token)
        .pipe(
          tap((resp: any) => {
               console.log(resp);
              const {_id, userName, email, img, role, lastSessionDate } = resp.user;
              this.user = new UserModel(_id, userName, email, img, role, lastSessionDate);
              this.ingresar();
              localStorage.setItem('x-token', resp.token);

          }),
          map(resp => true),
          catchError(error => of(false))
        );

    }


}
