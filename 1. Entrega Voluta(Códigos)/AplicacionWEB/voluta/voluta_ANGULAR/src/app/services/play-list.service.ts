import { Injectable } from '@angular/core';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})
export class PlayListService {

  constructor(private urlService: UrlService) { }

  verPlaylist(id: string){
    return this.urlService.getQuery(`playList/${id}`)
  }

  verPlayLists(query: string){
    return this.urlService.getQuery(`playLists${query}`)
  }

  crearPlayList(data: Object){
      return this.urlService.postQuery('playList', data);
  }

  editarPlayList(idPlayList: string, data:Object){
    return this.urlService.putQuery(`playList/${idPlayList}`, data);
  }

  buscarPlayList(termino: string){
    return this.urlService.getQuery(`search-playLists/${termino}`);
  }

  cargarImgPlayList(path: string){
    return this.urlService.getSingle(path);
  }

  crearM3UPlayList(playListID: string,) { // crea archivo m3u en server upload
   return this.urlService.postQueryM3u(`create-m3u`, { playListID });
  }

  quitarCancionDeLaPlayList(cancion: string, playList: string){
    return this.urlService.putQuery(`delete-song/${cancion}/playList/${playList}`, {});    
  }

  agregarCancionPlayList(playListId: string, cancionId: string){
    return this.urlService.putQuery(`add-song/${playListId}`, {songID: cancionId})
  }

  eliminarPlayListDeDispositivos(playListId: string){  // elimina la playList de todoooo
    return this.urlService.putQuery(`delete-playList/${playListId}`, {})
  }


}
