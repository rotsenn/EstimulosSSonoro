import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})
export class ComandosService {

  constructor(private url: UrlService) { }

  comandoDispositivo(comando: string, device: string){
     return this.url.postQuery(`comando`,{comando, device}) 
  }

  getDispositivos(){
    return this.url.getQuery(`devices`) 
  }

  crearDispositivo(data: object){
    return this.url.putQuery(`create-device`, data);
  }

  estado(data: string){
      return this.url.getQuery(``);
  }




  comando(comando: string, dispositivo: string){

      if(!comando){
        return;
      }

      console.log('Subiendo al dispositivo')
      this.comandoDispositivo(comando, dispositivo )
      .subscribe((resp: any) => {
        
          console.log(resp)
          console.log('Subió')

      }, (err: any) => console.log('Error', err))

  }



  reproducirPlayList(playList: string, dispositivo: string){

      this.comando('mpc clear', dispositivo);

      setTimeout(() => {
        this.comando(`mpc load`, dispositivo);
      },500);

  }


  cargarM3UEnDispositivo(playList: string, dispositivo: string, ){

     console.log('Creando playList En dispositivo...')
     this.comando(`download ${environment.base_url_do}/v1/upload/playLists/${playList}.m3u`, dispositivo)

  }


}
