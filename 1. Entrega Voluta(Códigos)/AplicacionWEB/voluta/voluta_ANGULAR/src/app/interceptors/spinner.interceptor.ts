import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { finalize } from "rxjs/operators";
import { SpinnerService } from '../services/spinner.service';

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor{

    constructor(private spinnerService: SpinnerService){ }

    cargar = this.spinnerService.cargar;

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

      if(this.cargar){
          this.spinnerService.show();
      }else{
        this.spinnerService.hide();
      }
        

        return next.handle(req).pipe(
            finalize(()=> this.spinnerService.hide()));
        
    }
}