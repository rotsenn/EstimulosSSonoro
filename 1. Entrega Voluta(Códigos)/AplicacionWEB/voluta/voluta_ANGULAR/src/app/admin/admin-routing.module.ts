import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CancionesComponent } from './cancion/canciones/canciones.component';
import { ComandosComponent } from './comandos/comandos.component';
import { DispositivosComponent } from './dispositivo/dispositivos/dispositivos.component';
import { PlayListsComponent } from './play-list/play-lists/play-lists.component';
import { PlayListComponent } from './play-list/play-list/play-list.component';
import { DispositivoComponent } from './dispositivo/dispositivo/dispositivo.component';
import { InterfacePlayListsComponent } from './interface/interface-play-lists/interface-play-lists.component';
import { InterfacePlayListComponent } from './interface/interface-play-list/interface-play-list.component';
import { InterfaceDispositivosComponent } from './interface/interface-dispositivos/interface-dispositivos.component';
import { InterfaceDispositivoComponent } from './interface/interface-dispositivo/interface-dispositivo.component';
import { InterfaceAddPlayListComponent } from './interface/interface-add-play-list/interface-add-play-list.component';
import { UsuarioConfigComponent } from './usuario/usuario-config/usuario-config.component';
import { UsuariosAdminComponent } from './usuario/usuarios-admin/usuarios-admin.component';

const routes: Routes = [
  // { path: 'dashboard', component: DashboardComponent }, 
  { path: 'canciones', component: CancionesComponent},
  // { path: 'comandos', component: ComandosComponent}, 
  { path: 'dispositivos', component: DispositivosComponent},
  { path: 'dispositivo/:dispositivo', component: DispositivoComponent},
  { path: 'playLists', component: PlayListsComponent},
  { path: 'playList/:playList', component: PlayListComponent},

  { path: 'interface/playLists', component: InterfacePlayListsComponent},
  { path: 'interface/playList/:playList', component: InterfacePlayListComponent},

  { path: 'interface/dispositivos', component: InterfaceDispositivosComponent},
  { path: 'interface/dispositivo/:dispositivo', component: InterfaceDispositivoComponent},
  { path: 'interface/dispositivo/addPlayLists/:dispositivo', component: InterfaceAddPlayListComponent},

  { path: 'configuracion-usuario', component: UsuarioConfigComponent},
  { path: 'usuarios', component: UsuariosAdminComponent},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
