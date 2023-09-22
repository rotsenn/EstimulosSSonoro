import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
export interface UsuarioI {
    id: string,
    name: string,
    role: string,
    img: string,
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  usuariosConectados:UsuarioI[] = []; 

  socketStatus: boolean = false;

  constructor(private socket: Socket) { }

  checkStatus(){
    this.socket.on('connect', () => {
       console.log('Conectado al servidor');
       this.socketStatus = true
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del servidor');
      this.socketStatus = false
    });
  }

  emmit(evento: string, payload?: any, callback?: Function){

    //emit('EVENTO, payload, callback)
     this.socket.emit(evento,payload,callback);

  }

  listen(evento: string){
     return this.socket.fromEvent( evento );
  }



  loginUser(usuario: UsuarioI){ // login sockets

      console.log('Configurando', usuario);
      this.emmit('config-user', usuario, (resp: any) => {

        console.log('La respuesta', resp);
        if(resp.payload.ok){
            // this.userService.usuariosEnLinea()
            // .subscribe((resp: any)=> {
            //     console.log(resp);
            // })
        }

    })




  }

}
