import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from '../guards/auth.guard'; 
import { PagesComponent } from './pages.component';


const routesPages: Routes = [
      {
            path: 'page',
            component: PagesComponent,
            canActivate: [ AuthGuard ],
            // canLoad: [ AuthGuard ],
            loadChildren: () => import('./pages-routing.module').then( m => m.PagesRoutingModule)
      },
];

@NgModule({
    imports: [ RouterModule.forChild(routesPages) ],
    exports: [ RouterModule ]
})

export class PagesRoutingModule {}
