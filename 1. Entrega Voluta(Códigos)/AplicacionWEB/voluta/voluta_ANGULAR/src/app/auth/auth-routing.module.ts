import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RecuperarPasswordComponent } from './recuperar-password/recuperar-password.component';
import { ValidarEmailComponent } from './validar-email/validar-email.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'recuperar-password/:token', component: RecuperarPasswordComponent }, 
  { path: 'validar-email/:token', component: ValidarEmailComponent }  
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
