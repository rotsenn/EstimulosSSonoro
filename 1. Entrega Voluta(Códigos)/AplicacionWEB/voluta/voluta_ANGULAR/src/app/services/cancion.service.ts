import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})
export class CancionService {

  
    constructor(private urlService: UrlService) { }

    vercancion(id: string){
      return this.urlService.getQuery(`song/${id}`)
    }

    verCancioes(query: string){
      return this.urlService.getQuery(`songs${query}`)
    }

    crearCancion(data: Object){
        return this.urlService.postQuery('song', data);
    }

    ediatrCancion(idCancion: string, data:Object){
      return this.urlService.putQuery(`song/${idCancion}`, data);
    }

    buscarCancion(termino: string){
      return this.urlService.getQuery(`search-songs/${termino}`);
    }

    cargarImg(path: string){
      return this.urlService.getSingle(path);
    }

    guardarCancionEnPlayLists(cancionId: string, playListsArray: any){
      return this.urlService.putQuery(`add-song-playlists/${cancionId}`,  playListsArray );
    }

    EliminarCancion(songId: string){
      return this.urlService.putQuery(`remove-song/${songId}`,  {} );
    }


    startPlayer(song: any){

      
      let song_player = JSON.stringify(song);

      let filePath = `${environment.base_url_do}/v1/upload/songs/${song.file}`;
      
      localStorage.setItem('cancion_sonando', song_player );
      document.getElementById("mp3-source")?.setAttribute("src", filePath);

      (document.getElementById("player") as any).load();
      (document.getElementById("player") as any).play();

      //@ts-ignore
      document.getElementById("play-song-title").innerHTML =  '<i class="icon-music-tone"></i>'+song.name;
  }

}
