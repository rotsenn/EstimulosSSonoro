import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  
  constructor() { }

  async actualizarFoto(
    archivo: File,
    tipo: 'users'|'playListsIMG',
    id: string
  ) {

    try {

      const base_url = environment.base_url_do;
      const url = `${ base_url }/v1/upload/${ id }/${ tipo }`;
      const formData = new FormData();
      formData.append('image', archivo);

      const resp = await fetch( url, {

          method: 'PUT',
          headers: {
            'x-token': localStorage.getItem('x-token') || ''
          },
          body: formData

      });

      const data = await resp.json();

      if ( data.ok ) {
        // return data.imageName;
        return {ok: true, nameSong: data.imageName}; 
      } else {
        // return false; 
        return {ok: false, msg: data.msg};
      
      }
      
    } catch (error) {
      console.log('Un error', error);
      return false;    
    }

  }



  async actualizarCancion(
    archivo: File,
    id: string,
    duration: Number
  ) {

    try {

      const base_url = environment.base_url_do;
      const url = `${ base_url }/v1/upload-song/${ id }?duration=${duration}`;
     
      const formData = new FormData();
      formData.append('song', archivo);

      const resp = await fetch( url, {

        method: 'POST',
        headers: {
          'x-token': localStorage.getItem('x-token') || ''
        },
        body: formData

      });

      const data = await resp.json();

      
      if ( data.ok ) {
        return {ok: true, nameSong: data.nameSong}; 
      } else {
        return {ok: false, msg: data.msg};
      }
      
    } catch (error) {
      console.log(error);
      return false;    
    }

  }
}
