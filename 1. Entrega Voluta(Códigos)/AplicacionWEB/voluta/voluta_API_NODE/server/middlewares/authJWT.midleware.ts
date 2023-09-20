import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import userModel from "../models/user.model";



export default class AuthMiddleware {


   public validateJWT (req: Request, res: Response, next: NextFunction) {

        // Leer el Token
        const token = req.header('x-token');   
       
        if ( !token ) {

            return res.status(401).json({
                ok: false,
                msg: 'No hay token en la petición'
            });

        }
    
        try {
            
            const { uid, hashSession }: any = jwt.verify( token, config.SEED ); 
            //@ts-ignore
            req.uid = uid; 
            //@ts-ignore
            req.hashSession = hashSession 
            //@ts-ignore
            req.tk = token;
            next();
    
        } catch (error) {

            return res.status(401).json({
                ok: false,
                msg: 'Token no válido'
            });

        }
     
   }



   public async all (req: Request, res: Response, next: NextFunction) {  // validacion de hash,  una sola sesión

        //@ts-ignore
        const uid = req.uid;
        //@ts-ignore
        const hashSession = req.hashSession;
        
        try {
            
                const userDB = await userModel.findById(uid);       
        
                if ( !userDB ) {
                    return res.status(404).json({
                        ok: false,
                        msg: 'Usuario no existe'
                    });
                }

                if(!hashSession || String(hashSession) !== String(userDB.hashSession)) {

                    userDB.hashSession = 'XXX';
                    await userDB.save();
                    return res.status(404).json({
                        ok: false,
                        session: true,
                        msg: 'Usted ya cuenta con una sesión activa, todas se cerrarán.'
                    });

                }
                
                if(!userDB.active) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'Usuario inactivo'
                    });
                }

                //@ts-ignore
                req.userDB = userDB;
                next();
        

        } catch (error) {

            res.status(500).json({
                ok: false,
                msg: 'Hable con el administrador',
                error
            });

        }

    }




    public async validateAdmin (req: Request, res: Response, next: NextFunction) {  // validacion de hash,  una sola sesión

        //@ts-ignore
        const uid = req.uid;
        //@ts-ignore
        const hashSession = req.hashSession;
        
        try {
            
                const userDB = await userModel.findById(uid);       
        
                if ( !userDB ) {
                    return res.status(404).json({
                        ok: false,
                        msg: 'Usuario no existe'
                    });
                }

                if(!hashSession || String(hashSession) !== String(userDB.hashSession)) {

                    userDB.hashSession = 'XXX';
                    await userDB.save();
                    return res.status(404).json({
                        ok: false,
                        session: true,
                        msg: 'Usted ya cuenta con una sesión activa, todas se cerraran.'
                    });

                }
                
                if(!userDB.active) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'Usuario inactivo'
                    });
                }

                if(userDB.role === 'ADMIN_ROLE' || userDB.role === 'SUPER_ROLE') {} else {
                    return res.status(400).json({
                        ok: false,
                        msg: `${ userDB.userName }, usted no cuenta con permisos suficientes. `
                    });
                }

                //@ts-ignore
                req.userDB = userDB;
                next();
        

        } catch (error) {

            res.status(500).json({
                ok: false,
                msg: 'Hable con el administrador',
                error
            });

        }

    }




}
