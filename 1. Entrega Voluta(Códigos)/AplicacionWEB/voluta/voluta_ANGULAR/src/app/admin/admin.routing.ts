import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from '../guards/auth.guard'; 
import { AdminComponent } from './admin.component';




const routesAdmin: Routes = [
      {
            path: 'admin',
            component: AdminComponent,
            canActivate: [ AuthGuard ],
            // canLoad: [ AuthGuard ],
            loadChildren: () => import('./admin-routing.module').then( m => m.AdminRoutingModule )
      },
];

@NgModule({
    imports: [ RouterModule.forChild(routesAdmin) ],
    exports: [ RouterModule ]
})
export class AdminRoutingModule {}
