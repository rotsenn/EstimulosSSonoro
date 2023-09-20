import axios from "axios";
import qs from 'qs'



    let verUsers = async (value: any) => {


        let header: any = {
            'Authorization':  'SharedAccessSignature sr=5de5143b-f79b-4f60-bc19-b72961b3fff9&sig=Z5Bx17bct7lH78QhwV6NxJPez%2Brf73%2FQVW0mDMPrqdc%3D&skn=crpCommand&se=1666533263468'
        };
  

        try {

            let resp = await axios.post(`https://crp.azureiotcentral.com/api/devices/rpi-01/commands/mpc?api-version=1.0`, {request: "mpc "+value}, {headers: header});
                // console.log(resp.data);             
          
       } catch (error: any) {
                // console.log(error);
                return false;            
        }


                   



    }


    verUsers('play');



