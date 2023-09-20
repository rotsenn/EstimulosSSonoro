import moment from 'moment';
moment.locale('es');


export class HoraConfig {

    public horaColombiaIsoDate_5;
    public horaMenosCinco;


    constructor() {

        // this.horaColombiaIsoDate_5 = moment().tz("America/Bogota").format(); 
        this.horaColombiaIsoDate_5 = moment().subtract(5,'hours').format();
        this.horaMenosCinco = moment().subtract(5,'hours').format();

    }



}



