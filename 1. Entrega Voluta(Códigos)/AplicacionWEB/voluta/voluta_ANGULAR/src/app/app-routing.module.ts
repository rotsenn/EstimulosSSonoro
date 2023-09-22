import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminRoutingModule } from './admin/admin.routing';
import { PagesRoutingModule } from './pages/pages.routing';
import { LoginComponent } from './auth/login/login.component';

const routes: Routes = [

  { path: '', component: LoginComponent},
 
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {useHash: true}),
    AdminRoutingModule,
    PagesRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
