import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlayListService } from '../../../services/play-list.service';

@Component({
  selector: 'app-interface-play-lists',
  templateUrl: './interface-play-lists.component.html',
  styleUrls: ['./interface-play-lists.component.css']
})
export class InterfacePlayListsComponent implements OnInit {


  paginacion = {
    items: 18,
    pagina: 1,
    paginaTotal: 0,
    totalItems: 0, 
  }
  btnAnt = true;
  btnSig = true;

  public playLists: any[] = [];

  buscadorPlayList =false;

  constructor(private playListService: PlayListService, private router: Router) { }

  ngOnInit(): void {
    this.getPlayList();
  }

  getPlayList(){
    console.log('Paginacion', this.paginacion)
    this.buscadorPlayList = false;
    const paginacion = `?items=${this.paginacion.items}&page=${this.paginacion.pagina}`;
    this.playListService.verPlayLists(paginacion)
    .subscribe((resp: any) => {  
      console.log('La respuesta', resp.playlists)    
         this.playLists = resp.playlists;
         this.paginacion.paginaTotal = resp.total_pages;
         this.paginacion.totalItems = resp.total;
     });
  }

  paginaAnterior(): any {

    if (this.paginacion.pagina > 1) {
        this.paginacion.pagina --;
        this.btnSig = true;
    }else {
        this.btnAnt = false;
        return;
    }
    this.getPlayList();

  }

  paginaSiguiente(): any {

      if (this.paginacion.pagina < this.paginacion.paginaTotal) {
          this.paginacion.pagina ++;
          this.btnAnt = true;
      } else {
          this.btnSig = false;
          return;
      }
      this.getPlayList();
  }


  detallePlayList(playListId: string){

    this.router.navigateByUrl(`/admin/interface/playList/${playListId}`)

  }

  buscarPlayList(termino: string){
    if(!termino){
      this.getPlayList();
      return
    }

    this.buscadorPlayList = true;

    this.playListService.buscarPlayList(termino)
    .subscribe((resp: any) => {
        if(resp.ok){
          console.log('respuesta', resp)
          this.playLists = resp.playLists;
          this.paginacion = {
            items: 18,
            pagina: 1,
            paginaTotal: 0,
            totalItems: this.playLists.length, 
          }
           
        }
    });
}

}
