

import axios from "axios";
import { tokenAzure, urlApiAzure } from '../config/config';



export class CommandDeviceClass {


    private authorization = '';
    private device

    constructor(device: string){
        this.authorization = tokenAzure;
        this.device = device
    }

    async commandMpc(command: string){

        let header: any = {
            'Authorization':  this.authorization
        };

        try {

                let resp = await axios.post(`${urlApiAzure}/${this.device}/commands/mpc?api-version=1.0`, {request: 'mpc '+command}, {headers: header});
                console.log(resp.data);  
                let data = {
                   ok: true,
                   msg: ''
                }  
                return data;          
        
        } catch (error: any) {

                 let data = {
                     ok: false,
                     err: error
                 } 
                
                return data;            
        }

    }



    async command(command: string){ // comandos diferentes a mpc  eje playSong <cancion>
      

        let header: any = {
            'Authorization':  this.authorization
        };

        try {

                let resp: any = await axios.post(`${urlApiAzure}/${this.device}/commands/mpc?api-version=1.0`, {request: command}, {headers: header});
                let respAzure = JSON.parse(resp.data.response);

                // console.log('La respuesta', respAzure);  

                let data = {
                    ok: respAzure.Ok,
                    response: respAzure
                };          
                return data; 

        } catch (error: any) {

            console.log('Disparo error commandDevice.class.ts')
           
            let data = {
                ok: false,
                err: error
            }            
           return data;           
        }

    }



    async deviceStatus(){

        let header: any = {
            'Authorization':  this.authorization
        };

        try {

                let resp = await axios.get(`${urlApiAzure}/${this.device}/properties?api-version=1.0`, {headers: header});
        
                let data = {
                   ok: true,
                   info: resp.data
                }  
                return data;          
        
        } catch (error: any) {

                 let data = {
                     ok: false,
                     err: error
                 } 
                
                return data;            
        }

    }
          

}