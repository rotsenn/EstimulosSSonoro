import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { config } from '../config/config';


export default class ActivateAccountMiddleware {


   public validateJWTValidateAccount (req: Request, res: Response, next: NextFunction) {

        // Leer el Token
        const token: any = req.query.token;   
       
        if ( !token ) {

                return res.status(401).json({
                    ok: false,
                    msg: 'No hay token-a en la petición'
                });
        }
    
        try {
            
                const { uid, hash }: any = jwt.verify( token, config.SEEDVALIDATEACCOUNT );            
                //@ts-ignore
                req.uid = uid; 
                //@ts-ignore
                req.hash = hash  
                next();
    
        } catch (error) {

                return res.status(401).json({
                    ok: false,
                    msg: 'El link ha caducado'
                });

        }
     
   }

 


}
