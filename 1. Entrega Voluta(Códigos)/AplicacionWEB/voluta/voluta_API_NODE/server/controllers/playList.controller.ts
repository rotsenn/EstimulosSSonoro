import { Request, Response } from "express";
import playListModel from "../models/playList.model";
import { isValidObjectId } from 'mongoose';
import songModel from "../models/song.model";
import { crearM3U } from "../helpers/crearM3U";
import { borrarArchivo } from '../helpers/actualizar-archivo';
import { CommandDeviceClass } from '../classes/commandDevice.class';
import deviceModel from "../models/device.model";
import { deleteUpload } from '../helpers/deleteUpload';
import taskModel from "../models/task.model";



export class PlayListController {

    createPlayList(req: Request, res: Response){

        //@ts-ignore
        let userId = req.uid;
      
        let { name, description, type } = req.body;
        let data = {name, description, type, user: userId };

        playListModel.create(data, (err, genre) =>{ 

            if(err){
                return res.status(500).json({
                    ok: false,
                    msg: 'Error al guardar, intentalo nuevamente.',
                    err
                });
            }

            if(!genre){
                return res.status(404).json({
                    ok: false,
                    msg: 'La lista de reproducción no se pudo crear, intentalo nuevamente.'
                });
            }

            return res.json({
                ok: true,
                msg:'Lista de reproducción creado con éxito.',
                genre
            });
        
        });

    }



    getPlayList(req: Request, res: Response) {

        let playListID = req.params.id;
        
        if(!isValidObjectId(playListID)){
            return res.status(500).json({
                ok: false,
                msg: 'Error en la petición.'
            });
        }

        playListModel.findById(playListID)
        .populate('songs.song')
        .exec((err: any, playList: any) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }
            if(!playList){
                return res.status(404).json({
                    ok: false,
                    msg: 'La lista de reproducción no existe.'
                });
            }

            return res.json({
                ok: true,
                playList
            })
        });

    }



    getPlayLists(req: Request, res: Response) {


        let itemsPerPage = Number(req.query.items) || 30;
        let pagina = Number(req.query.page) || 1;
            pagina = Number(pagina - 1);

            let desde = pagina * itemsPerPage;
                desde = Number(desde);

        playListModel.find()
        .populate('songs.song')
        .skip(desde)
        .limit(itemsPerPage)
        .exec((err: any, playlists: any) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }
            
            playListModel.countDocuments((err, count) => {

                if(err){
                    return res.status(500).json({
                        ok: false,
                        msg: 'Error en la petición.'
                    });
                }

                return res.json({
                    ok: true,                 
                    total: count,
                    total_pages: Math.ceil(count/itemsPerPage),
                    page: pagina + 1,
                    playlists
                });

            });


        });

    }



    updatePlayList(req: Request, res: Response) {

        let playListID = req.params.id;
        let { name, description, type } = req.body;

        if(!isValidObjectId(playListID)){
            return res.status(500).json({
                ok: false,
                msg: 'Error en la petición.'
            });
        }

        let data = {  name, description, type };

        playListModel.findByIdAndUpdate(playListID, data,{new: true},(err, song) =>{

            if(err){
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }

            if(!song){
                return res.status(404).json({
                    ok: false,
                    msg: 'La playList no existe.'
                });
            }

            return res.json({
                ok: true,
                msg:'PalyList actualizada con éxito.',
                song
            });
        
        });


    }



    async addSongPlayList(req: Request, res: Response){

        let songID  = req.body.songID;
        let playListID = req.params.playList;


        if(!isValidObjectId(playListID) || !isValidObjectId(songID)){
            return res.status(500).json({
                ok: false,
                msg: 'Error en la petición.'
            });
        }

        try {

            let validateSong = await songModel.findById(songID);
            if(!validateSong){
                return res.status(400).json({
                     ok: false,
                     msg: 'La canción que tratar de añadir no existe.'
                });
            }

            let validatePlayList: any = await playListModel.findById(playListID);
            if(!validateSong){
                return res.status(400).json({
                     ok: false,
                     msg: 'La play list no existe.'
                });
            }

            let  songExist = validatePlayList.songs.find((songs: any) => String(songs.song) === songID );
            if(songExist){
                return res.json({
                    ok: false,
                    msg: 'Ey!! La canción ya se encuentra agregada en la playList.'
                })
            }

            let addSong = await playListModel.findByIdAndUpdate(playListID, {$push:{songs:{song: songID}}}, {new: true});
            if(!addSong){
                return res.status(400).json({
                    ok: false,
                    msg: 'Error!  La canciín no se pudo añadir a la lista de reproducción.'
                });
            }

            //@ts-ignore
            crearM3U(playListID, req.tk);


            
            res.json({
                ok: true,
                msg: 'Canción añadida con éxito',
                song: addSong
            })


            
        } catch (error) {

            return res.status(500).json({
                ok: false,
                msg: 'Error al añadir, intentalo nuevamente.',
                error
            });
            
        }        

    }


    async deleteSongPlayList(req: Request, res: Response){


        let {playListID, songID }  = req.params;

        if(!isValidObjectId(playListID) || !isValidObjectId(songID)){
            return res.status(500).json({
                ok: false,
                msg: 'Error en la petición2.'
            });
        }

         try {

            const data = {
                $pull:{songs:{song: songID }},
            }

            const quitSong =  await playListModel.findByIdAndUpdate(playListID, data );
            if(!quitSong){
                return res.status(403).json({
                    ok: false,
                    msg:'No se pudo quitar la canción de la lista de reproduccion.'
                });
            }


            //@ts-ignore
            crearM3U(playListID, req.tk);

            res.json({
                ok: true,
                msg: 'Canción quitada con éxito',
            })


             
         } catch (error) {

            return res.status(500).json({
                ok: false,
                msg: 'Error! No se pudo quitar la canción de la lista de reproduccion. Intentalo nuevamente.',
                error
            });
             
         }

    }



    searchPlayList(req: Request, res: Response) {

        let termino = req.params.term;
        let regex = new RegExp(termino, 'i');
        if(!termino){
            return;
        }

        playListModel.find({$or:[{name: regex},{type: regex},{description: regex}]})
        .populate('songs.song')
        .limit(24)
        .exec((err, playLists) =>{

            if(err){
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }

            return res.json({
                ok: true,
                playLists
            });

        });

    }


    async deletePlayList(req: Request, res: Response){

        let playListId: any = req.params.playlist;
        //@ts-ignore
        let token = req.tk;

        if(!isValidObjectId(playListId)){
             return res.status(400).json({
                 ok: true,
                 msg: 'Play List invalida',
             })
        }


        try {
            


                    let devicesDB = await deviceModel.find({});


                    let playListDB = await playListModel.findById(playListId);
                    if(!playListDB){
                        return res.status(401).json({
                            ok: false,
                            msg: 'No se encontró la playList'
                        });
                    }

                    let countPlayListInDevice = await deviceModel.countDocuments({'playLists.playlist': playListId});


                    const data = {
                        $pull:{playLists:{playlist: playListId }},
                    }
    
                    //TODO ELIMINAR TAREAS DEL DISPOSITIVO CON ESTA PLAYLIST   

                        const updateDevicePlayList =  await deviceModel.updateMany({'playLists.playlist': playListId}, data );
                        console.log(updateDevicePlayList)

                    //TODO consultar tareas con el playList  y eliminarlas
                    await taskModel.deleteMany({playList: playListId})
                    
                    await playListModel.findByIdAndDelete(playListId);

                

                    let deleteImg = await deleteUpload('playListsIMG',playListDB.img, token);
                    let deletem3u = await deleteUpload('playLists',playListDB._id+'.m3u', token);

                    if(countPlayListInDevice > 0){

                        for(let d of devicesDB) {
                            let commandDeviceClass = new CommandDeviceClass(d.identifier);
                            let status = await commandDeviceClass.command(`removeplaylist ${playListId}.m3u`);
                        }

                    }


                    res.json({
                        ok: true,
                        msg:'PlayList eliminado con éxito,',
                        deleteImg,
                        deletem3u
                        
                    });

        } catch (error) {
    
            res.json({
                ok: false,
                msg:'PlayList eliminado con éxito,',
                
            });

        }


    }

}

