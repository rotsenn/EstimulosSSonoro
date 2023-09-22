import { Component, OnInit } from '@angular/core';
import { DispositivoService } from '../../services/dispositivo.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  dispositivos: any[] = [];

  constructor(private dispositovo: DispositivoService) { }

  ngOnInit(): void {
    this.getDispositivos();
  }

  getDispositivos(){
    this.dispositovo.getDispositivos()
    .subscribe((resp: any) => {
      if(resp.ok){
        this.dispositivos = resp.devices;
        console.log(this.dispositivos);
      }    
    })
  }

}
