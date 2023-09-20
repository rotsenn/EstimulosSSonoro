import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import moment from 'moment';
import userModel from '../models/user.model';
import { generateJWTValidateAccount } from '../helpers/jwt';
import AccountVerification from '../classes/AccountVerification.class';
import { isValidObjectId } from 'mongoose';
import { json } from 'body-parser';
import { userOnLine } from '../sockets/socket';



moment.locale('es');


export default class UserController {


    async createUserIni(req: Request, res: Response){   // Crear usuario Inicial   SUPER_ROLE

       

        if(!req.query.pass || req.query.pass !== 'SROLE' || req.query.pass === undefined) {
            return res.status(403).json({
                ok: true,
                msg: 'No es posible crear el usuario.'
            });
        }

        const salt = bcrypt.genSaltSync();   
        let user = {
            userName: 'root',
            email: 'root@root.com', 
            password: bcrypt.hashSync( 'S0p0rt3', salt ),
            role: 'SUPER_ROLE',
            accountActivated: true,
            hash:'',                           
            user: '61523d9662c92e002e486be4',
            createdAtTMP: moment().unix()                                        
        };

        let existUserName = await userModel.findOne({userName: 'root'});
           if(existUserName){
               return res.status(403).json({
                   ok: false,
                   msg: 'El usuario ya fue creado.'
               });
           }

        let newUserSuperRole = await userModel.create(user);
           if(!newUserSuperRole){
                return res.status(403).json({
                    ok: true,
                    msg: 'No se pudo crear el usuario, intentalo nuevamente.'
                });
           }
           return res.json({
                ok: true,
                msg: 'Usuario root creado con exito'
           });


    }


    getUser(req: Request, res: Response) {

        let userId = req.params.id;

        if(!isValidObjectId(userId)){
            return res.status(500).json({
                ok: false,
                msg: 'Error en la petición.'
            });
        }

        userModel.findById(userId, (err: any, user: any) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }
            if(!user){
                return res.status(404).json({
                    ok: false,
                    msg: 'El usuario no existe.'
                });
            }

            return res.json({
                ok: true,
                user
            })
        });

    }



    async  getUsers(req: Request, res: Response) {

        // TODO: Validar permisos para esta acción
        let active = req.query.active;
        let items = 15;
        let itemsPerPage = items;

        let page = Number(req.query.page) || 1;
            page = Number(page - 1);

        let desde = page * items;
            desde = Number(desde);


            if (!active){}else{

                    if(active === 'true' || active === 'false' ){} else {
                        return res.status(403).json({
                            ok: false,
                            msg: 'active incorrecto'
                        });
                    }

            }

            let activ = true
            if(active === 'false'){
                console.log('entró')
                activ = false;
            }

       userModel.find({active: activ})
        .sort({created: -1})
        .skip(desde)
        .limit(items)
        .exec((err: any, users: any) => {

            if(err) {
                return res.status(500).json({
                    ok: false,
                    err                        
                })
            }
           userModel.countDocuments({active: activ}, (err, count) => { 
                if(err) {
                    return res.status(500).json({
                        ok: false,
                        err                        
                    })
                }
                res.json({
                    ok: true,                    
                    total: count,  
                    pages: Math.ceil(count/itemsPerPage),
                    users                          
                })
            });

        });

    }




    async disableAndEnableUser(req: Request, res: Response){ // Inhabilitar y habilitar user.  // Solo lo hace el admin user 

        const { userID } = req.body;
    
        //@ts-ignore
        let user = req.uid;


  
        if(!userID || !isValidObjectId(userID)) {
             return res.status(401).json({
                 ok: false,
                 msg: 'El usuario a inhabilitar es requerido.'
             });
        }
  
        try {
 
                 let userDB = await userModel.findById(userID);                
                 if(!userDB) {
                     return res.status(401).json({
                         ok: false,
                         msg: 'El usuario no existe'
                     });                    
                 }
                 console.log(String(userDB._id) === String(userID));

                 if(String(userDB._id) === String(user)){
                    return res.status(401).json({
                        ok: false,
                        msg: 'Ey! el mismo usuario no se puede inhabilitar'
                    }); 
                 }
  
                 if(userDB.role === "SUPER_ROLE"){
                     return res.status(401).json({
                         ok: false,
                         msg: 'Este usuario no se puede inhabilitar'
                     });   
                 }
                
                 let actionSelected = '';
                 if(!userDB.active){ 
                     userDB.active = true;
                     actionSelected = 'habilitado';
                 } else{
                     userDB.active = false;
                     actionSelected = 'inhabilitado';
                 }
                 
                 await userDB.save();
 
                 res.json({
                     ok: true,
                     msg:`Usuario ${ actionSelected } con exito`
                 });
 
 
            
        } catch (error) {
 
             res.status(500).json({
                 ok: false,
                 error,
                 msg: 'Error inesperado... revisar logs'
             });
            
        }
 
    }


   async updateUser(req: Request, res: Response){    
        
        let userId = req.params.user;

        const { 
            name,
            email,
            role,                
        
        } = req.body;

    try {    

             if(!isValidObjectId(userId)){
                 return res.status(401).json({
                     ok: false,
                     msg: 'Usuario invalido'
                 });
             }
        

                if(role === 'ADMIN_ROLE' || role === 'USER_ROLE'){}else{
                    return res.status(403).json({
                        ok: false,
                        msg: 'Ey! rol invalido.  Roles validos: (ADMIN_ROLE y USER_ROLE)'
                    });
                }        
                
                
                let userDB: any = await userModel.findById(userId);
                if(!userDB){
                    return res.status(401).json({
                        ok: false,
                        msg: 'El usuario no existe'
                    });
                }

                if(userDB.email === email){
                    delete userDB.email;
                }



                const accountVerification =  new AccountVerification();
                let newHash = '';


                if(userDB.email !== email) {

                    const emailExist = await userModel.findOne({ email });                                
                    if(emailExist) {
                        return res.status(401).json({
                            ok: false,
                            msg: 'El Email ingresado ya se encuentra registrado'
                        });
                    }  
                
                    newHash = accountVerification.createHash();


                    userDB.userName = name;
                    userDB.email = email;
                    userDB.role = role
                    userDB.accountActivated = false;

                    await userDB.save();

                    
                    let tokenAccountVerification: any = await generateJWTValidateAccount(userId, newHash, '10h');  
                    await accountVerification.accountUserVerification(email, tokenAccountVerification, name);

                    return res.json({
                        ok: true,
                        msg: 'Usuario actualizado con éxito, se enviará un email para que active la cuenta.'
                    });
                    
                    
                }


                userDB.userName = name;
                userDB.role = role
                await userDB.save();

       } catch (error) {

            return res.status(500).json({
                ok: false,
                msg: 'No se pudo actualizar el usuario, intentalo nuevamente.'
            });
            
       }
    }




    //////////////CREAR USUARIO  SOLO ADMIN_ROLE y SUPER_ROLE LO CREA
    async createUser(req: Request, res: Response) {   

        //@ts-ignore
        let uid = req.uid || '';


          const { 
                    name,
                    email,
                    role,                
                
                } = req.body;

            try {    
                

                        if(role === 'ADMIN_ROLE' || role === 'USER_ROLE'){}else{
                            return res.status(403).json({
                                ok: false,
                                msg: 'Ey! rol invalido.  Roles validos: (ADMIN_ROLE y USER_ROLE)'
                            });
                        }                    

                        console.log('Filtro de roles')
                
                        const emailExist = await userModel.findOne({ email });                                
                        if(emailExist) {
                            return res.status(401).json({
                                ok: false,
                                msg: 'El Email ingresado ya se encuentra registrado'
                            });
                        }  

                        console.log('Existe email', emailExist);


                        const accountVerification =  new AccountVerification();
                        const hash =  accountVerification.createHash();

                        const salt = bcrypt.genSaltSync();   
                                        
                        let user = {
                            userName: name,
                            email, 
                            password: bcrypt.hashSync( '123', salt ),
                            role,
                            hash,                           
                            user: uid,
                            createdAtTMP: moment().unix()                                        
                        };

                                                  
                        // Guardar user
                        let newUser = await userModel.create(user);
                        if(!newUser){
                            return res.status(401).json({
                                ok: false,
                                msg: 'El usuario no se pudo crear, intentalo nuevamente.'
                            });
                        }

                        let tokenAccountVerification: any = await generateJWTValidateAccount(newUser._id, hash, '10h');  
                        await accountVerification.accountUserVerification(email, tokenAccountVerification, name);
                        
                        res.json({
                            ok: true,
                            user,
                            msg: 'Usuario creado con éxito, se enviará un email para que active la cuenta.'
                        });
    
    
        } catch (error) {
            console.log(error);
            res.status(500).json({
                
                ok: false,
                error,
                msg: 'Error inesperado... revisar logs'
            });

        }

        
    }


    searchUser(req: Request, res: Response) {

        let termino = req.params.term;
        let active = req.query.active

        let regex = new RegExp(termino, 'i');
        if(!termino){
            return;
        }

        if (!active){}else{

            if(active === 'true' || active === 'false' ){} else {
                return res.status(403).json({
                    ok: false,
                    msg: 'active incorrecto'
                });
            }

        }

        let activ = true
        if(active === 'false'){
            console.log('entró')
            activ = false;
        }

        userModel.find({$and:[{active: activ},{userName: regex}]})
        .limit(24)
        .exec((err, users) =>{

            if(err){
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }

            return res.json({
                ok: true,
                users
            });

        });

    }




    //////////////EDITAR USUARIO  SOLO ADMIN_ROLE y SUPER_ROLE EDITA EMAIL Y ROLE
    async userUpdate(req: Request, res: Response){

        let userID = req.params.id;  
         //@ts-ignore
        let user = req.userDB;  // Datos del usuario que trata de hacer la actualizacion

        if(!isValidObjectId(userID)) {
            return res.status(404).json({
                ok: false,
                msg: 'User invalido'
            })
        }

        const {name, email, role} = req.body;
        let data = {name, email, role };

        try {

            let userUpdate: any = await userModel.findById(userID); // consulta de usuario que se va a actualizar.
            if(!userUpdate){
                return res.status(404).json({
                    ok: false,
                    msg: 'El usuario no existe.'
                });
            }

            if(user.role === 'USER_ROLE') { 
                
                if(user._id === userUpdate._id ) {

                    delete data.email;
                    delete data.role;
                    delete userUpdate.email;
                    delete userUpdate.role;
                  
                    userUpdate.userName = name;                     
                    await userUpdate.save();

                    return res.json({
                        ok: true,
                        msg: 'Usuario actualizado exitosamente.'
                    })

                }else{

                    return res.status(401).json({
                        ok: false,
                        msg: 'Sin permisos para esta acción.'
                    });

                }

             } else if(user.role === 'SUPER_ROLE' || user.role === 'ADMIN_ROLE' ){

                    userUpdate.userName = name;                  
                    userUpdate.role = role;

                    if(email === userUpdate.email){
                         delete userUpdate.email;
                    } else {

                            userUpdate.email = email;
                            userUpdate.accountActivated = false;

                            const accountVerification =  new AccountVerification();
                            let newHash = accountVerification.createHash(); 

                            userUpdate.hash = newHash;

                            await userUpdate.save();
                                                
                            let tokenAccountVerification: any = await generateJWTValidateAccount(userID, newHash, '10h');  
                            await accountVerification.accountUserVerification(email, tokenAccountVerification, name);
                            return res.json({
                                ok: true,
                                msg:'Usuario Actualizado con éxito',        
                            });

                    }

                    await userUpdate.save();
                    return res.json({
                        ok: true,
                        msg:'Usuario Actualizado con éxito',

                    })


             }else{
                return res.status(401).json({
                    ok: false,
                    msg: 'Sin permisos para esta acción.'
                });
             }
            
        } catch (error) {

            res.status(500).json({
                ok: false,
                error,
                msg: 'No se pudo actualizar el usuario intentalo de nuevo. '
            });
            
        }        

    }


   async changePassword(req: Request, res: Response){

        //@ts-ignore
        let user = req.uid;

        let {passActual, passNuevo, passValidacion} = req.body;

        try {

            let userDB = await userModel.findById(user);

            if(!userDB){
               return res.status(401).json({
                    ok: false,
                    msg: 'Ey! El usuario no existe. '
                });
            }

            const validPassword = bcrypt.compareSync( passActual, userDB.password );
            if ( !validPassword ) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Contraseña actual incorrecta.'
                });
            }

            if(passNuevo !== passValidacion ){
                return res.status(401).json({
                    ok: false,
                    msg: 'Ey! Las contraseñas no coinciden. '
                });
            }

            const salt = bcrypt.genSaltSync();  
            userDB.password =  bcrypt.hashSync( passNuevo, salt ),
            await userDB.save();

            return res.json({
                ok: true,
                msg: 'Contraseña actualizada con éxito'
            })
     
            
        } catch (error) {

            res.status(500).json({
                ok: false,
                error,
                msg: 'Ey! No se pudo actualizar la contraseña. '
            });
            
        }

        
    }

    async updateUserName(req: Request, res: Response) {

        //@ts-ignore
        let userId = req.uid;
        let _user = req.params.user;
        let userName = req.body.name;

        console.log(req.body);
 
        try {
            
  

                if(!isValidObjectId(_user)){
                    return res.status(401).json({
                        ok: false,
                        msg: 'Usuario invalido'
                    })

                }

                if(userName === '' || userName === undefined){
                    return res.status(401).json({
                        ok: true,
                        msg: 'El nombre de usuario es requerido'
                    });
                }

                if(String(userId) !== String(userId)){
                    return res.status(401).json({
                        ok: false,
                        msg: 'No tienes permisos para realizar la acción;'
                    });
                }

                let userDb = await userModel.findById(_user);
                if(!userDb){
                    return res.status(401).json({
                        ok: false,
                        msg: 'Ey! el usuario no existe.'
                    });
                }

                userDb.userName = userName;
                await userDb.save();

                res.json({
                    ok: true,
                    msg: 'Nombre de usuario actualizado con éxito.',
                    user: userDb
                })

            } catch (error) {
                console.log(error);
                return res.status(401).json({
                    ok: false,
                    msg: 'Ey! No se pudo guardar el nombre de usuario, intentalo de nuevo.',
                    
                });
                    
            }


    }



    usersOnLine(req: Request, res: Response){
           
        let usersOnLine = userOnLine;

        return res.json({
            ok: true,
            usersOnLine
        })
    }



}