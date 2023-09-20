import axios from 'axios';
import { urlServerUpload } from '../config/config';



 export let deleteUpload = async (type: "playListsIMG" | "users" | "playLists" | "songs" , name: string, token: string) =>{


    let header: any = {
        //@ts-ignore
        'x-token':  token
    };
    
    try {
        //v1/upload-remove/:type/:name    //playListsIMG ó users ó playLists ó songs
        let resp = await axios.put(`${urlServerUpload}/v1/upload-remove/${type}/${name}`,{headers: header});
        console.log(resp.data)
        return true
        
    } catch (error) {
        console.log('No se pudo crear m3u')
        return false;
    }  


  

 }