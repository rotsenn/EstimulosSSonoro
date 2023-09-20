import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import userModel from "../models/user.model";



export default class AuthMiddleware {


   public validateJWT (req: Request, res: Response, next: NextFunction) {

        // Leer el Token
        let token: any = '';
        if(req.header('x-token') && !req.query.tk){
           token = req.header('x-token');
        }
        if(!req.header('x-token') && req.query.tk){
           token = req.query.tk;   
        }

       
        if ( !token ) {
            return res.status(401).json({
                ok: false,
                msg: 'No tk en la petición'
            });
        }
    
        try {
            
            const { uid }: any = jwt.verify( token, config.SEED ); 
            //@ts-ignore
            req.uid = uid; 

            next();
    
        } catch (error) {

            return res.status(401).json({
                ok: false,
                msg: 'Tk no válido'
            });

        }
     
   }


   public validateJWTUpdateSeedUpdate (req: Request, res: Response, next: NextFunction) {

    // Leer el Token
    const token: any = req.query.tk;   
   
    if ( !token ) {
        return res.status(401).json({
            ok: false,
            msg: 'No tk en la petición'
        });
    }

    try {
        
            const { uid }: any = jwt.verify( token, config.SEEDUPLOAD ); 
            //@ts-ignore
            req.uid = uid; 

            next();

        } catch (error) {

            return res.status(401).json({
                ok: false,
                msg: 'Tk no válido'
            });

        }
 
   }

   


}
