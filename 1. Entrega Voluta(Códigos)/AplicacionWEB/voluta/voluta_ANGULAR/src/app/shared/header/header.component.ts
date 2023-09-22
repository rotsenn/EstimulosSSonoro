import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserModel } from '../../models/userModel';
import { Router } from '@angular/router';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

    public user?: UserModel;
    public imgUser: any;

    constructor(private authService: AuthService, public userService: UserService, private router: Router, private wsService: WebsocketService) {     
        this.user = userService.user;
        this.imgUser = userService.user?.getImagen() ;
        console.log('Esta es',this.imgUser)
    }

    ngOnInit(): void {
      this.user = this.userService.user;
    }

    urlUsuarioConfig(){
       this.router.navigateByUrl('/admin/configuracion-usuario')
    }

    salir(){
      this.authService.logout();
      let payload: any = {
        id: this.user?.id,
        name: '',
        role: '',
        img: '',
      }
      this.wsService.emmit('config-user', payload );
    }

}
