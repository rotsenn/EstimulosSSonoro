import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

const base_url = environment.base_url;
const base_url_do = environment.base_url_do;  // digital osean

@Pipe({
  name: 'musica'
})
export class MusicaPipe implements PipeTransform {

  transform(cancion: unknown): any {

    const routeImage = `${base_url_do}/v1/upload`;

    if(!cancion){
        return ``;
    } else if(cancion) {
         console.log(`${routeImage}/songs/${cancion}`);
        return `${routeImage}/songs/${cancion}`;      
    }

}

}
