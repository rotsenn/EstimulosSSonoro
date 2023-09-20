import { Request, Response } from "express";
import songModel from "../models/song.model";
import { isValidObjectId } from 'mongoose';
import axios from "axios";
import { config } from "../config/config";
import playListModel from "../models/playList.model";
import playListRoutes from "../routers/playList.routes";
import { crearM3U } from '../helpers/crearM3U';
import moment from 'moment';
import { HoraConfig } from '../config/hora';
import taskModel from "../models/task.model";



export default class GenreController {



    createSong(req: Request, res: Response){

        //@ts-ignore
        let userId = req.uid;
      
        let { name, description } = req.body;
        let data = { name, duration: 0, description, user: userId };

        console.log(req.body);

        songModel.create(data, (err, song) =>{
            if(err){
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.',
                    err
                });
            }

            if(!song){
                return res.status(404).json({
                    ok: false,
                    msg: 'La canción no se pudo crear, intentalo nuevamente.'
                });
            }

            return res.json({
                ok: true,
                msg:'Canción creada con éxito.',
                song
            });
        
        })

    }


    getSong(req: Request, res: Response) {

            let songId = req.params.id;

            if(!isValidObjectId(songId)){
                return res.json({
                    ok: false,                    
                    msg: 'Sin nombre.',
                    song: songId
                });
            }

            songModel.findById(songId, (err: any, song: any) => {
                if(err){
                    return res.status(500).json({
                        ok: false,
                        msg: 'Error en la petición.',
                        songId
                    });
                }
                if(!song){
                    return res.status(404).json({
                        ok: false,
                        msg: 'La cancion no existe.'
                    });
                }

                return res.json({
                    ok: true,
                    song
                })
            });

    }


    getSongs(req: Request, res: Response) {


        let itemsPerPage = Number(req.query.items) || 30;
        let pagina = Number(req.query.page) || 1;
            pagina = Number(pagina - 1);

            let desde = pagina * itemsPerPage;
                desde = Number(desde);

        songModel.find()
        .sort({createdAt: -1})
        .skip(desde)
        .limit(itemsPerPage)
        .exec((err: any, songs: any) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }
            
            songModel.countDocuments((err, count) => {

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
                    songs
                });

            });


        });

    }


    updateSong(req: Request, res: Response){

        let songId = req.params.id;
        let {name, description  } = req.body;

        if(!isValidObjectId(songId) || songId === undefined || songId === ''){
            return res.status(500).json({
                ok: false,
                msg: 'Error en la petición.'
            });
        }

        let data = { name, description };

        songModel.findByIdAndUpdate(songId, data,{new: true},(err, song) =>{

            if(err){
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }

            if(!song){
                return res.status(404).json({
                    ok: false,
                    msg: 'La canción no existe.'
                });
            }

            return res.json({
                ok: true,
                msg:'Canción actualizada con éxito.',
                song
            });
        
        });

    } 


    async removeSong(req: Request, res: Response){


        let songId: any = req.params.song;

        if(!isValidObjectId(songId)){
            return res.status(401).json({
                ok: false,
                msg: 'Canción inválida'
            });
        }

        try {
            


                    let playLists:any[] = [];
                    let validateSongPlayList: any = await playListModel.find({'songs.song': songId});
                    

                    
                    const today = moment(new HoraConfig().horaMenosCinco).unix(); // actual                                      


                      
                     
                    if(validateSongPlayList.length > 0){

                    
                        for(let s of validateSongPlayList){
                                playLists.push(s._id);
                        }

                        let validatePlayListTask = await taskModel.find({playList:{$in: playLists}, startDateUnix:{ $gt: today }  });


                        if(validatePlayListTask.length > 0){
                            return res.status(401).json({
                                ok: true,
                                msg: 'No se puede eliminar la canción por que se encuentra en una lista próxima a sonar en el dispositivo.'
                            });
                        }


                     
                        const quitSongs =  await playListModel.updateMany( { 'songs.song': songId} , {$pull:{songs:{song: songId }  }});

                        if(quitSongs.modifiedCount < 1){
                            return res.status(403).json({
                                ok: false,
                                msg:'No se pudo quitar la canción de la lista de reproduccion, por favor intentalo nuevamente.'
                            });
                        }

                        let removeSong = await songModel.findOneAndDelete(songId);
                        console.log(removeSong)
                        if(!removeSong){
                                return res.status(403).json({
                                    ok: false,
                                    msg:'No se pudo quitar la canción de la lista de reproduccion.'
                                });
                        }


                        for(let pl of playLists){
                            //@ts-ignore
                            let createM3U = await crearM3U(pl, req.tk);
                            console.log('Se creó m3u', createM3U);
                        }


                        return res.json({
                                ok: true,
                                msg: 'Canción eliminada con éxito.'                
                        });

                    }

                    let removeSong = await songModel.findOneAndDelete(songId);
                    if(!removeSong){
                            return res.status(403).json({
                                ok: false,
                                msg:'No se pudo quitar la canción de la lista de reproduccion.'
                            });
                    }

                    return res.json({
                        ok: true,
                        msg: 'canción eliminada con éxito'
                    });

            } catch (error) {
                console.log(error);

                res.status(500).json({
                    ok: false,
                    error,
                    msg: 'No se pudo eliminar la canción, intentalo nuevamente.'
                });      
        
            }

    }


    async addSongPlayLists(req: Request, res: Response) {  // agragar canciones a una o varias playLists

        const songId = req.params.id;
        const playListsId: any = req.body;   //llega [{ playList: ''} ]

        if(!isValidObjectId(songId)){
            return res.status(500).json({
                ok: false,
                msg: 'Data no válida'
            })
        }

        let playLists:any[] = [];

        for(let p of playListsId){ 
            playLists.push(p.playList) 
        }

        if(playListsId.length < 1){
            return res.status(403).json({
                ok: false,
                msg: 'Sin Data' 
            });
        }

        for(let pl of  playLists){ 

            try {

                    let prueba = await playListModel.findById(pl);
                    
                    let consulta = prueba?.songs.find(resp => String(resp.song) === String(songId));
                    if(!consulta){
                        await playListModel.findByIdAndUpdate( pl, { $addToSet: {songs: {song: songId} } } );
                        //@ts-ignore
                        crearM3U(pl, req.tk);
                    }

            } catch (error) {
                 console.log(error)
            }          
        
        }

        // let songsPlayList = await playListModel.updateMany({ "_id": { "$in": playLists } }, {$addToSet:{songs:{song: songId}}}, {new: true});
        
        res.json({
            ok: true,
            msg:'Canciones agregadas con éxito',
        });


    }
 


    searchSong(req: Request, res: Response) {

        let termino = req.params.term;

        let regex = new RegExp(termino, 'i');
        if(!termino){
            return res.status(400).json({ 
                ok: false,
                msg:'No hay término de busqueda.',                 
            });
        }

        let request: any = {$or:[{name: regex},{description: regex}]};

        songModel.find(request)
        .limit(50)
        .exec((err, songs) => {

            if(err){
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.' 
                });
            }

            return res.json({
                ok: true,
                songs
            });

        });

    }




    // async searchSongName(req: Request, res: Response){

    //     let songId = req.params.song;

    //     if(!isValidObjectId(songId)){
    //         return res.status(401).json({
    //             ok: true, 
    //             msg: 'Cancion invalida.'
    //         })
    //     }

    //     try {
    //         let song = await songModel.findById(songId);
    //         if(!song){
    //             return res.status(400).json({
    //                 ok: false,
    //                 msg: 'No se encontró la canción'
    //             })
    //         }

    //         return res.json({
    //             ok: true,
    //             song: song.name,
    //         })
            
    //     } catch (error) {
            
    //     }


    // }


    async command(req: Request, res: Response){

        let {comando, device} = req.body; 

        console.log('El body', req.body);
       

        let header: any = {
            'Authorization':  'SharedAccessSignature sr=5de5143b-f79b-4f60-bc19-b72961b3fff9&sig=Z5Bx17bct7lH78QhwV6NxJPez%2Brf73%2FQVW0mDMPrqdc%3D&skn=crpCommand&se=1666533263468'
        };

        try {

                let resp = await axios.post(`${config.urlApiAzure}/devices/${device}/commands/mpc?api-version=1.0`, {request: comando}, {headers: header});
              
                res.json({
                    ok: true,
                     response: resp.data
                });          
        
        } catch (error: any) {
           
                 res.status(500).json({
                     error
                 });         
        }

    }

    async getDevicesAzure(req: Request, res: Response){


        let header: any = {
            'Authorization':  'SharedAccessSignature sr=5de5143b-f79b-4f60-bc19-b72961b3fff9&sig=Z5Bx17bct7lH78QhwV6NxJPez%2Brf73%2FQVW0mDMPrqdc%3D&skn=crpCommand&se=1666533263468'
        };

        try {

                let resp = await axios.get(`https://crp.azureiotcentral.com/api/devices?api-version=1.0`,{headers: header}); 
                res.json({
                    ok: true,
                     devices: resp.data.value
                });          
        
        } catch (error: any) {
               
                 res.status(500).json({
                     error
                 });         
        }


    }



    async createDevicesAzure(req: Request, res: Response){

        let id= req.body.id
        let data = req.body;
        
        delete data.id



        let header: any = {
            'Authorization':  'SharedAccessSignature sr=5de5143b-f79b-4f60-bc19-b72961b3fff9&sig=Z5Bx17bct7lH78QhwV6NxJPez%2Brf73%2FQVW0mDMPrqdc%3D&skn=crpCommand&se=1666533263468'
        };

        try {

                let resp = await axios.put(`https://crp.azureiotcentral.com/api/devices/${id}?api-version=1.0`,data,{headers: header});   
                     
                res.json({
                    ok: true,
                     devices: resp.data.value
                });          
        
        } catch (error: any) {
               
                 res.status(500).json({
                     ok: false,
                     error,
                     msg: 'Error'
                 });         
        }


    }








}