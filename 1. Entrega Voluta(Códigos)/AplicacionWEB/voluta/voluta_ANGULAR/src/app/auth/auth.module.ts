import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecuperarPasswordComponent } from './recuperar-password/recuperar-password.component';
import { ValidarEmailComponent } from './validar-email/validar-email.component';


@NgModule({
  declarations: [
    LoginComponent,
    RecuperarPasswordComponent,
    ValidarEmailComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AuthModule { }
