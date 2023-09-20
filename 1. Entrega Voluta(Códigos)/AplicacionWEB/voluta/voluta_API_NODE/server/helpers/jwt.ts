
import jwt from 'jsonwebtoken';
import { config } from '../config/config';


//////////////////////////////////    JWT       ////////////////////////////////////////////////////////
export  const generateJWT = (uid: string, hashSession: string) => {

        return new Promise( ( resolve, reject ) => {   
            
            const payload = {
                uid,
                hashSession
            };
        
            jwt.sign( payload, config.SEED, {
                expiresIn:  '3h'
            }, ( err, token ) => {    
                if ( err ) {
                    reject('No se pudo generar el JWT');
                } else {
                    resolve( token );
                }    
            });

        });

}



//////////////////////////////////    JWT VALIDAR EMAIL       ////////////////////////////////////////////////////////
export  const generateJWTValidateAccount = (uid: string, hash: string, time: string) => {

    const payload = {
        uid,
        hash
    };

    return new Promise( ( resolve, reject ) => {        
    
        jwt.sign( payload, config.SEEDVALIDATEACCOUNT, {
            expiresIn:  time
        }, ( err, token ) => {    
            if ( err ) {
                reject('No se pudo generar el token');
            } else {
                resolve( token );
            }    
        });

    });

}



