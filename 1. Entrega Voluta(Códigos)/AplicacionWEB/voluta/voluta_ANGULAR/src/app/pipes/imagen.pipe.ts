import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

//  const base_url = environment.base_url; 

// const base_url = 'http://68.183.142.245/api'  
const base_url = environment.base_url_do;
const token = localStorage.getItem('x-token');

@Pipe({
  name: 'imagen'
})
export class ImagenPipe implements PipeTransform {
  

  transform(img: unknown, tipo: 'users'|'playListsIMG'): any {

      const routeImage = `${base_url}/v1/get-upload`;
      if(!img){
          return `${routeImage}/${tipo}/no-image.jpg?tk=${token}`;
      } else if(img) {
        // console.log('TODA ESTA', `${routeImage}/${tipo}/${img}?tk=${token}` )
          return `${routeImage}/${tipo}/${img}?tk=${token}`;
        
      }

  }

}
