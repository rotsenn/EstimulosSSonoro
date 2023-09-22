import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertirSegundos'
})
export class ConvertirSegundosPipe implements PipeTransform {

  transform(segundos: any): any {
  
      let seconds = Number(segundos);
      let hour: any = Math.floor(seconds / 3600);
      hour = (hour < 10)? '0' + hour : hour;
      let minute: any = Math.floor((seconds / 60) % 60);
      minute = (minute < 10)? '0' + minute : minute;
      let second: any = seconds % 60;
      second = (second < 10)? '0' + second : second;

      return hour + ':' + minute + ':' + second;
    

  }

}
