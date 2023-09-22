import { Injectable } from '@angular/core';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})
export class DispositivoService {

  constructor(private urlService: UrlService) { }

  getDispositivos(){ // dispositivos en azure
    return this.urlService.getQuery(`device-azure`) 
  }

  verDispositivo(id: string){
    return this.urlService.getQuery(`device/${id}`)
  }

  verDispositivos(query: string){
    return this.urlService.getQuery(`devices${query}`)
  }

  crearDispositivo(data: Object){
      return this.urlService.postQuery('device', data);
  }

  editarDispositivo(iddevice: string, data:Object){
    return this.urlService.putQuery(`device/${iddevice}`, data);
  }

  buscarDispositivo(termino: string){
    return this.urlService.getQuery(`search-device/${termino}`);
  }

  eliminarDispositivo(device: string){
    return this.urlService.putQuery(`delete-device/${device}`, {ok: true});    
  }

  agregarPlayListADispositivo(device: string, playList: string){
    return this.urlService.putQuery(`add-playList/${device}`, {playList});
  }

  // quitarPlayListDispositivo(device: string, playList: string){
  //   return this.urlService.putQuery(`quit-playList/:deviceID/playList/:playListID/${device}`, {playList});
  // }

   quitarPlayListDispositivo(device: string, playList: string){
     return this.urlService.putQuery(`quit-playList/${device}/playList/${playList}`, {});
   }

   sincronizarPlayListsEnDispositivos(playList: string) {     
    return this.urlService.putQuery(`syncUp-playList-devices/${playList}`, {});
   }





   crearTarea(device: string, data: Object) {
     return this.urlService.putQuery(`create-task?device=${device}`, data);
   }

   getTareas(device: string, query: string){
     return this.urlService.getQuery(`tasks${query}&device=${device}`);
   }

  //  buscarTarea(device:string, termino: string) {
  //   return this.urlService.getQuery(`search-task/${termino}/device/device`);
  //  }

   buscarTareaNumero(device:string, numeroTarea: number){
     return this.urlService.getQuery(`task/${numeroTarea}?device=${device}`);
   }

   eliminarTarea(device:string, task: string){
    return this.urlService.putQuery(`delete-task/${device}`, {task});
   }
   
   editarTarea(device:string, data: object, task: any){
     return this.urlService.putQuery(`update-task/${task}?device=${device}`, data); 
   }

   //DispAzure
   estadoActualDispositivo(device: string){
     return this.urlService.getQuery(`device-status?device=${device}`);
   }

   mpcComando(device: string, command: string){
    return this.urlService.getQuery(`mpc?device=${device}&command=${command}`);
   }

   comando(device: string, command: string){ // ejecuta comando no nativo (no mpc)
    return this.urlService.getQuery(`command?device=${device}&command=${command}`);
   }

   cargarM3UEnDispositivo(device: string, command: string){
      console.log('Creando playList En dispositivo...')
      return this.urlService.getQuery(`command?device=${device}&command=${command}`);
   }

  


    
 







}
