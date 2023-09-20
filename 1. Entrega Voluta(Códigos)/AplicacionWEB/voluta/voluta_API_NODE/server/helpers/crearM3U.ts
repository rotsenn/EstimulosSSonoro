import axios from 'axios';
import { urlServerUpload } from '../config/config';



 export let crearM3U = async (playListID: string, token: string) =>{

    console.log('PlayList', playListID );
    console.log('TOKENNNN', token);

    let header: any = {
        //@ts-ignore
        'x-token':  token
    };
    
    try {

        let resp = await axios.post(urlServerUpload+'/v1/create-m3u', {playListID}, {headers: header});
        console.log(resp.data)
        return true
        
    } catch (error) {
        console.log('No se pudo crear m3u')
        return false;
    }  


  

 }