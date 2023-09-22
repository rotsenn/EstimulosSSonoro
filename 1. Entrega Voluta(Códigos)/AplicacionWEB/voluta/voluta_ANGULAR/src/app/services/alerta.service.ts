import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {

  constructor() { }


  alertaExito(msg: string): void{

    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: msg,
      showConfirmButton: false,
      timer: 3000
    });

  }

  alertaError(msg: string): void{

    Swal.fire({
      position: 'top-end',
      icon: 'error',
      title: msg,
      showConfirmButton: false,
      // timer: 1500
    });

  }

  cargando(): void {

      Swal.fire({
        title: 'Por favor espere.',
        html: 'Cargando información...',
        allowOutsideClick: false,
        // onBeforeOpen: () => {
        //     Swal.showLoading();
        // },
      });
      Swal.showLoading();

  }

  cerrarCargando(): void{
     Swal.close();
  }



}
