
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import moment from 'moment';
import { isValidObjectId } from 'mongoose';
import { actualizarImage, actualizarArchivoSong, uploadRemove } from '../helpers/actualizar-archivo';
import playListModel from '../models/playList.model';
import { uploadServer } from '../config/config';
import userModel from '../models/user.model';
const { v4: uuidv4 } = require('uuid');

moment.locale('es');



export default class UploadController {


    async uploadArchivo(req: Request, res: Response){  // todos los roles,  si es USER_ROLE sólo su propia imagen 

            //@ts-ignore
            const uid = req.uid;
            //@ts-ignore
            const user: any = await userModel.findById(uid); // userDB dato que se asigna en el middleware all
            const {id, type} = req.params; // _id y tipo  user, artista ó album

            if(!id || !isValidObjectId(id)){
                return res.status(400).json({
                    ok: false,
                    msg: 'id invalido'
                });
            }

            // validar tipos de path
            const tiposValidos = ['playListsIMG','users'];
            if(!tiposValidos.includes(type)) {

                return res.status(400).json({
                    ok: false,
                    msg: 'No es tipo permitido'
                });

            }

            if(type === 'users') {  // Si tipo es usuario sólo puede editar su propia imagen
                if(id !== uid){
                    return res.status(400).json({
                        ok: false,
                        msg: 'No estás autorizado, avisaré a tus padres. '
                    });
                }
            }else{

                    if(user.role === 'SUPER_ROLE' || user.role === 'ADMIN_ROLE' ){}else{
                        return res.status(400).json({
                            ok: false,
                            msg: 'No tienes permisos para realizar la acción. '
                        });
                    }               

            }
          
           // Validar que exista un archivo

           if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).json({
                    ok: false,
                    msg: 'No hay ningún archivo'
                });
           }

           // procesar Imagen
           const file: any = req.files.image;
           const nombreCortado = file.name.split('.')
           const extensionArchivo = nombreCortado[nombreCortado.length -1];
           const extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];

           if(!extensionesValidas.includes(extensionArchivo)) {

                return res.status(400).json({
                    ok: false,
                    msg: 'No es una extensión permitida'
                });

           }

           const nombreImagen = `${id}.${extensionArchivo}`;

           //path para guardar imagen;
           const path = `./dist/server/uploads/${type}/${nombreImagen}`; 

           //mover la imagen
           file.mv(path, (err: any) => {
                if (err){
                    return res.status(500).json({
                        ok: false,
                        err,
                        msg: 'Error al mover la imagen 1'
                    });
                }

                //actualizar DB
                actualizarImage(type, id, nombreImagen);                   
            
                return res.json({
                    ok: true,
                    msg: 'Archivo subido',
                    imageName: nombreImagen
                });

           });

    }



    uploadSong(req: Request, res: Response){  // Solo admins 


        const { id } = req.params; // _id song
        const duration = req.query.duration // duración de la canción en segundos

        if(!id || !isValidObjectId(id)){

            return res.status(500).json({
                ok: false,
                msg: 'id invalido'
            });
        }

      
       // Validar que exista un archivo
       if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                ok: false,
                msg: 'No hay ningún archivo'
            });
       }

       // procesar archivo
       const file: any = req.files.song;
       const nombreCortado = file.name.split('.')
       const extensionArchivo = nombreCortado[nombreCortado.length -1];
       const extensionesValidas = ['mp3'];

       if(!extensionesValidas.includes(extensionArchivo)) {

            return res.status(400).json({
                ok: false,
                msg: 'No es una extensión permitida'
            });

       }

    //    const nombreArchivo = `${uuidv4()}.${extensionArchivo}`;
     
       const nombreArchivo = `${id}.${extensionArchivo}`; 

       //path para guardar archivo;
       const path = `./dist/server/uploads/songs/${nombreArchivo}`; 

       //mover la imagen
       file.mv(path, (err: any) => {
            if (err){
                return res.status(500).json({
                    ok: false,
                    err,
                    msg: 'Error al mover archivo'
                });
            }

            //actualizar DB
            actualizarArchivoSong(id, nombreArchivo, Number(duration));                   
        
            return res.json({
                ok: true,
                msg: 'Archivo subido',
                nameSong: nombreArchivo
            });

       });
    }



    returnArchivoM3U(req: Request, res: Response) { // retorna archivo m3u Y song

        const {type, name} = req.params;
        if(type === 'songs' || type === 'playLists'){}else{
            return res.status(401).json({
                ok: false,
                msg: 'Tipo no valido'
            })
        }

        const pathImg =  path.join(__dirname,`../../../dist/server/uploads/${type}/${name}`);

        console.log(pathImg)
        
        if(fs.existsSync(pathImg)){
              console.log('Existeeee');
             res.sendFile(pathImg); 
        }else{
            const pathImg =  path.join(__dirname,`../../../dist/server/uploads/no-img.jpg`);
             res.sendFile(pathImg); 
        }      

    }

    returnArchivo(req: Request, res: Response) {



        const {type, name} = req.params;

        if(type ==='users' || type ==='playListsIMG' || type ==='playLists' || type ==='songs'){} else{

            return res.status(401).json({
                ok: false,
                msg: 'archivo invalido'
            })

        }

        const pathImg =  path.join(__dirname,`../../../dist/server/uploads/${type}/${name}`);

        // console.log(pathImg) 
        
        if(fs.existsSync(pathImg)){
              console.log('Existeeee');
             res.sendFile(pathImg); 
        }else{
            const pathImg =  path.join(__dirname,`../../../dist/server/uploads/no-img.jpg`);
             res.sendFile(pathImg); 
        }      

    }



    async createM3U(req: Request, res: Response) {

        const {playListID} = req.body;
        if(!isValidObjectId(playListID)){

            return res.status(500).json({
                ok: false,
                msg: 'PlayList invalido'
            });
        }

        try {

                    let playListDB: any = await playListModel.findById(playListID);
                    if(!playListDB) {
                        return res.status(403).json({
                            ok: false,
                            msg: 'PlayList invalido'
                        });
                    }


                    let playList = '';

                    playList += `#EXTM3U\n`;
                    for (let p of playListDB.songs) {
                        console.log(p)
                        playList += `${uploadServer}/api/v1/upload/songs/${p.song}.mp3\n`;
                    }
            
                    fs.writeFile(`./dist/server/uploads/playLists/${ playListID }.m3u`, playList, (err) => {
            
                        if (err)
                            return res.status(500).json({
                                ok: false,
                                msg: 'Archivo PlayList no se pudo crear. intentalo nuevamente. '
                            });
                        else
                            return res.json({
                                ok: true,
                                msg: 'Archivo play List creada con éxito.' 
                            });
            
                    });
            
        } catch (error) {

            return res.status(500).json({
                ok: false,
                msg: 'Upsss!  algo anda mal, intentalo nuevamente'
            });
            
        }

    }


    async uploadRemove(req: Request, res: Response){

        let {type, name} = req.params;
        if(type ==='user' || type ==='playListsIMG' || type ==='playList' || type ==='song'){} else{

            return res.status(401).json({
                ok: false,
                msg: 'archivo invalido'
            })

        }

        let remove = await uploadRemove(type, name);

        if(!remove){
            return res.json({
                ok: false,
                msg: 'No se pudo eliminar el archivo'
            });
        }

        return res.json({
            ok: true,
            msg: 'Archivo eliminado con éxito'
        });

        
    }



}