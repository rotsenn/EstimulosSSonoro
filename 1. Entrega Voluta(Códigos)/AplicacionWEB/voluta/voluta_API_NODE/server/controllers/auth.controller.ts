import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import userModel from '../models/user.model';
import { generateJWT, generateJWTValidateAccount } from '../helpers/jwt';
import AccountVerification from '../classes/AccountVerification.class'; 
import { HoraConfig } from '../config/hora';


export default class AuthController {

    
    async login (req: Request, res: Response) {
        
        const { email, password } = req.body;  

        if(!email){

                return res.status(401).json({
                    ok: false,
                    message: "El email es requerido."
                });
        }
    
        if(!password){

            return res.status(401).json({
                ok: false,
                message: "El pasword es requerido."
            });

        }
    

        try {
            
                // Verificar email
                const usuarioDB: any = await userModel.findOne({ email });
               
                if ( !usuarioDB ) {
                    return res.status(404).json({
                        ok: false,
                        msg: 'Usuario o contraseña incorrecto.'
                    });
                }


                if(!usuarioDB.active) {           
                
                    return res.status(401).json({
                        ok: false,                  
                        msg: "Usuario deshabilitado, comunícate con el administrador."
                    });
                }


                // Verificar contraseña
                const validPassword = bcrypt.compareSync( password, usuarioDB.password );
                if ( !validPassword ) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'Usuario o contraseña incorrecto'
                    });
                }

                if (!usuarioDB.accountActivated) {

                           
                    const accountVerification =  new AccountVerification();
                    const hash =  accountVerification.createHash();
                    usuarioDB.hash = hash;
                    await usuarioDB.save();

                                   
                    let tokenAccountVerification: any = await generateJWTValidateAccount(usuarioDB.id, hash, '20h');  
                    let emailEnviado =  await accountVerification.accountUserVerification(usuarioDB.email, tokenAccountVerification, usuarioDB.userName);                
                                      
                    return res.status(400).json({
                        ok: false,
                        msg: 'Aún no has activado tu cuenta, revisa tu correo y validalo. '
                    });
    
                }

                const hashSession =  new AccountVerification().createHash();

                usuarioDB.hashSession = hashSession;
                usuarioDB.lastSessionDate = usuarioDB.currentSession;
                usuarioDB.currentSession = new HoraConfig().horaMenosCinco;
                               
               

                await usuarioDB.save();
              
                // Generar el TOKEN - JWT
                const token = await generateJWT( usuarioDB.id, hashSession );

                res.json({
                    ok: true,
                    token,
                });


        } catch (error) {
        
            res.status(500).json({
                ok: false,
                msg: 'Hable con el administrador',
                error
            });
            
        }


    }



    async validateAccount(req: Request, res: Response) {

        try {

                    //@ts-ignore
                    const uid = req.uid; 
                    //@ts-ignore 
                    const  hash = req.hash;                

                    // Obtener el usuario por UID (Entra por el token)
                    const userDB: any = await userModel.findById( uid );
                    if(!userDB) {
                        return res.status(403).json({
                            ok: false,
                            msg: ''
                        });
                    }

                    if(userDB.accountActivated) {

                        return res.status(401).json({
                            ok: false,
                            msg: 'La cuenta ya se encuentra activada.'
                        });

                    }

                    if(String(userDB.hash) === String(hash)) {

                        userDB.hash = null;
                        userDB.accountActivated = true;
                        await userDB.save();
                        return res.json({
                            ok: true,
                            msg: 'Cuenta activada con éxito.'
                        });

                    }else {

                        return res.status(403).json({
                            ok: false,
                            msg: 'El token cambió, por favor trata de iniciar sesión para enviarte una nueva validación por email.'
                        });

                    }

            
        } catch (error) {

            res.status(500).json({
                ok: false,
                msg: 'Error!,  revisar logs',
                error
            });
            
        }


    }




    //Enviar email de recuperacion de contraseña
    async passwordReset(req: Request, res: Response) {

            try {
    
                    const { email } = req.body;
                    // Obtener el usuario por UID
                    const user: any = await userModel.findOne( {email} );

                    if(!user) {
                        return res.status(403).json({
                            ok: false,
                            msg: 'Email no encontrado, asegúrese de que esté bien escrito.'
                        });
                    }
    
                    if(!user.active) {
    
                        return res.status(401).json({
                            ok: false,
                            msg: 'Usuario inactivo, comuníquese con el administrador.'
                        });
    
                    }
    
    
                    const accountVerification =  new AccountVerification();
                    const hash =  accountVerification.createHash();
                    user.hash = hash;
                    await user.save();
    
                                   
                    let tokenRecuperarPassword: any = await generateJWTValidateAccount(user._id, hash, '1h');
                    let emailEnviado =  await accountVerification.passwordReset(user.email, tokenRecuperarPassword, user.userName);
    
                    if(emailEnviado) {
    
                        return res.json({
                            ok: true,
                            msg: 'Te enviamos un email para que recuperes tu contraseña.'
                        });
    
                    }else {
    
                        return res.status(403).json({
                            ok: false,
                            msg: 'Algo salió mal, por favor inténtalo nuevamente.'
                        });
    
                    }
    
        
            } catch (error) {
    
                res.status(500).json({
                    ok: false,
                    msg: 'Error!,  revisar logs',
                    err: error
                });
                
            }
    
    }



    // Validar que el token esté correcto para mostrar formulario de recuperación en front.
    validateTokenNewPassword(req: Request, res: Response) { 

        //@ts-ignore
        const uid = req.uid; 
        //@ts-ignore 
        const  hash = req.hash;
        if(uid && hash) {

                return res.json({
                    ok: true,
                    msg: 'ok',
                });

        } else {

                return res.status(401).json({
                    ok: false,
                    msg: 'Not',
                });

        }

    }



    // cambiar password por recuperación
    async newPasswordReset(req: Request, res: Response) { 

        //@ts-ignore
        const uid = req.uid; 
        //@ts-ignore 
        const  hash = req.hash;
        
        const { password1, password2 } = req.body;
        if(password1 !== password2) {
            return res.status(401).json({
                ok: false,
                msg: 'Las contraseñas no coinciden.'
            });
        }

        // Obtener el usuario por UID
        const userDB: any = await userModel.findById( uid );
        if(!userDB) {
            return res.status(403).json({
                ok: false,
                msg: ''
            })
        }


        if(String(userDB.hash) === String(hash)) {

            const salt = bcrypt.genSaltSync();

            userDB.hash = null;
            userDB.password = bcrypt.hashSync( password1, salt ), 
            await userDB.save();

            return res.json({
                ok: true,
                msg: 'La nueva contraseña fue creada con éxito.'
            });

        } else {

            return res.status(403).json({
                ok: false,
                msg: 'El token ha caducado, por favor intenta recuperar contraseña nuevamente.'
            });

        }
        
    }
    



    // Renovar token para manejo de sesion en el front
    async renewToken(req: Request, res: Response) {

        //@ts-ignore
        const uid = req.uid;
        //@ts-ignore
        const hashSession = req.hashSession;
        //@ts-ignore
        const user = req.userDB

        // Generar el TOKEN - JWT
        const token = await generateJWT( uid, hashSession );

        res.json({
            ok: true,
            token,
            user,
            // menu: getMenuFrontEnd( usuario.role ) 
        });

    }

 
}