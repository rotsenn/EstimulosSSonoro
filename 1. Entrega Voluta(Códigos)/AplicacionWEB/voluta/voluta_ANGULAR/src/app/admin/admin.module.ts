import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';

import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { SharedModule } from '../shared/shared.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../pipes/pipes.module';
import { ComponentesModule } from '../componentes/componentes.module';
import { CancionesComponent } from './cancion/canciones/canciones.component';
import { ComandosComponent } from './comandos/comandos.component';
import { DispositivosComponent } from './dispositivo/dispositivos/dispositivos.component';
import { PlayListsComponent } from './play-list/play-lists/play-lists.component';
import { PlayListComponent } from './play-list/play-list/play-list.component';
import { DispositivoComponent } from './dispositivo/dispositivo/dispositivo.component';
import { InterfacePlayListsComponent } from './interface/interface-play-lists/interface-play-lists.component';
import { InterfacePlayListComponent } from './interface/interface-play-list/interface-play-list.component';
import { InterfaceDispositivoComponent } from './interface/interface-dispositivo/interface-dispositivo.component';
import { InterfaceDispositivosComponent } from './interface/interface-dispositivos/interface-dispositivos.component';
import { InterfaceAddPlayListComponent } from './interface/interface-add-play-list/interface-add-play-list.component';
import { UsuarioConfigComponent } from './usuario/usuario-config/usuario-config.component';
import { UsuariosAdminComponent } from './usuario/usuarios-admin/usuarios-admin.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { SpinnerInterceptor } from '../interceptors/spinner.interceptor';



@NgModule({
  declarations: [
    AdminComponent,
    DashboardComponent,
    CancionesComponent,
    ComandosComponent,
    DispositivosComponent,
    PlayListsComponent,
    PlayListComponent,
    DispositivoComponent,
    InterfacePlayListsComponent,
    InterfacePlayListComponent,
    InterfaceDispositivoComponent,
    InterfaceDispositivosComponent,
    InterfaceAddPlayListComponent,
    UsuarioConfigComponent,
    UsuariosAdminComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    ComponentesModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMaterialTimepickerModule,

    MatButtonModule,
    MatFormFieldModule,
    MatRippleModule,
    MatAutocompleteModule,
    MatSlideToggleModule

  ],
  // providers: [{ provide: HTTP_INTERCEPTORS, useClass: SpinnerInterceptor, multi: true}],
})
export class AdminModule { }
