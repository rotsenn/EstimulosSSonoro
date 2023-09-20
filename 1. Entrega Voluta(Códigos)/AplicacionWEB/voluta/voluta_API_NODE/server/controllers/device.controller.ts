import { Request, Response } from "express";
import deviceModel from "../models/device.model";
import { isValidObjectId } from 'mongoose';
import { config, tokenAzure, urlServerUpload } from '../config/config';
import axios from "axios";
import { CommandDeviceClass } from '../classes/commandDevice.class';
import taskModel from "../models/task.model";
import moment from 'moment';
import { HoraConfig } from '../config/hora';
import mongoose from 'mongoose';
import { crearM3U } from '../helpers/crearM3U';
import { deleteUpload } from '../helpers/deleteUpload';



export class DeviceController {

    


    createDevice(req: Request, res: Response){

        //@ts-ignore
        let userId = req.uid;
      
        let { name, identifier, description, location  } = req.body;
        let data = { name, identifier, description, location, user: userId };

        deviceModel.create(data, (err, device) =>{ 
            if(err){
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }

            if(!device){
                return res.status(404).json({
                    ok: false,
                    msg: 'El dispositivo no se pudo crear, intentalo nuevamente.'
                });
            }

            return res.json({
                ok: true,
                msg:'Dispositivo creado con éxito.',
                device
            });
        
        })

    }


    getdevice(req: Request, res: Response) {

            let deviceId = req.params.id;

            if(!isValidObjectId(deviceId)){
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }

            deviceModel.findById(deviceId)
            .populate('playLists.playlist') 
            .exec((err: any, device: any) => {
                if(err){
                    return res.status(500).json({
                        ok: false,
                        msg: 'Error en la petición.',
                        err
                    });
                }
                if(!device){
                    return res.status(404).json({
                        ok: false,
                        msg: 'El dispositivo no existe.'
                    });
                }

                return res.json({
                    ok: true,
                    device
                })
            });

    }


    getdevices(req: Request, res: Response) {

        let itemsPerPage = Number(req.query.items) || 30;
        let pagina = Number(req.query.page) || 1;
            pagina = Number(pagina - 1);

            let desde = pagina * itemsPerPage;
                desde = Number(desde);

        deviceModel.find({})
        // .populate('playLists.playList') 
        .sort({createdAt: -1})
        .skip(desde)
        .limit(itemsPerPage)
        .exec((err: any, device: any) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }
            
            deviceModel.countDocuments((err, count) => {

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
                    device
                });

            });


        });

    }


    updatedevice(req: Request, res: Response){

        let deviceId = req.params.id;
        let { name, identifier, description, location  } = req.body;

        if(!isValidObjectId(deviceId)){
            return res.status(500).json({
                ok: false,
                msg: 'Error en la petición.'
            });
        }

        let data = { name, identifier, description, location };
        deviceModel.findByIdAndUpdate(deviceId, data,{new: true},(err, device) =>{
            if(err){
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }

            if(!device){
                return res.status(404).json({
                    ok: false,
                    msg: 'El dispositivo no existe.'
                });
            }

            return res.json({
                ok: true,
                msg:'Dispositivo actualizado con éxito.',
                device
            });
        
        })

    }


    async deletedevice(req: Request, res: Response){

        let deviceId: any = req.params.device;

        if(!isValidObjectId(deviceId)){
           return res.status(500).json({
               ok: false,
               msg: 'Dispositivo invalido'
           });
        }

        const today = moment(new HoraConfig().horaMenosCinco).unix(); // actual                  
        let validatePlayListTask = await taskModel.find({ device: deviceId , startDateUnix: { $gt: today } });

        if(validatePlayListTask.length > 0) {
            return res.status(401).json({
                ok: true,
                msg: 'El dispositivo cuenta con tareas programadas, para eliminarlo debes cancelarlas todas'
            });
        }
        

        await taskModel.deleteMany({device: deviceId});
        await deviceModel.findByIdAndDelete(deviceId);
        return res.json({
            ok: true,
            msg: 'Dispositivo eliminado con éxito.'
        });

    }



    searchdevice(req: Request, res: Response) {

        let termino = req.params.term;

        let regex = new RegExp(termino, 'i');
        if(!termino){
            return;
        }

        deviceModel.find({$or:[{name: regex},{description: regex},{identifier: regex},{location: regex}]})
        .limit(30)
        .exec((err, devices) =>{

            if(err){
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }

            return res.json({
                ok: true,
                devices
            });

        });

    }



    async addPlayListDevice(req: Request, res: Response){

        let deviceID  = req.params.device;
        let playListID = req.body.playList;


        if(!isValidObjectId(playListID) || !isValidObjectId(deviceID)){
            return res.status(500).json({
                ok: false,
                msg: 'Error en la petición.'
            });
        }

        try {

            let validateDevice = await deviceModel.findById(deviceID);
            if(!validateDevice){
                return res.status(400).json({
                     ok: false,
                     msg: 'El dispositivo no existe.'
                });
            }

            // let playListExist = deviceModel.findOne( {_id: playListID }, {playLists: {$all: [playList]}, hobbies: {$in:
            //     ["footing", "baloncesto"]}} 

            // let obectId: any =  new mongoose.Types.ObjectId(playListID)  

            // console.log('Convertido a string', console.log(obectId)); 

           let  playListExist = validateDevice.playLists.find(playList => String(playList.playlist) === playListID );
                if(playListExist){
                    return res.json({
                        ok: false,
                        msg: 'Ey!! La playList ya se encuentra agregada en el dispositivo.'
                    })
                }
           

            let addPlayList = await deviceModel.findByIdAndUpdate(deviceID, {$push:{playLists:{playlist: playListID}}}, {new: true});
            if(!addPlayList){
                return res.status(400).json({
                    ok: false,
                    msg: 'Error!  el playList no se pudo añadir al dispositivo.'
                });
            }

            //Ultimo
            let comando = `download ${urlServerUpload}/v1/upload/playLists/${playListID}.m3u`;  // comando con ruta desde donde el dispositivo debe descargar la playList
            let commandCargarM3UDevice = new CommandDeviceClass(validateDevice.identifier);
            let cargarM3U: any = await commandCargarM3UDevice.command(comando);

            if(cargarM3U.ok === false){  // si el dispositivo no recibe el comando eliminamos la playList

                const data = {
                    $pull:{playLists:{playlist: playListID }},
                }

                const diveceDB =  await deviceModel.findByIdAndUpdate(validateDevice._id, data );

                return res.json({
                    ok: false,
                    msg: 'Ey! no se ha podido sincronizar con el dispositivo, intentalo nuevamente.',
                    respDisp: cargarM3U
                })

            }

            
            res.json({
                ok: true,
                msg: 'PlayList añadida con éxito',
                resp: addPlayList,
                respDisp: cargarM3U
            })
            
        } catch (error) {

            return res.status(500).json({
                ok: false,
                msg: 'Error al añadir, intentalo nuevamente.',
                error
            });
            
        }        

    }



    async syncUpAddPlayListDevices(req: Request, res: Response){

        let playListID = req.params.playlist;


        if(!isValidObjectId(playListID)){
            return res.status(500).json({
                ok: false,
                msg: 'Error en la petición.'
            });
        }

        try {


                    //@ts-ignore
                   await crearM3U(playListID, req.tk);

                    let respDevice:any[] = [];

                    let devices = await deviceModel.find({'playLists.playlist': playListID});

                    if(devices.length < 1){
                        return res.status(400).json({
                            ok: false,
                            msg: 'La play list no se encuentra asociada a ningún dispositivo'
                        });
                    }

                    for(let d of devices) {


                        let deviceDB: any = await deviceModel.findById(d._id);

                        //Ultimo
                        let comando = `download ${urlServerUpload}/v1/upload/playLists/${playListID}.m3u`;  // comando con ruta desde donde el dispositivo debe descargar la playList
                        let commandCargarM3UDevice = new CommandDeviceClass(deviceDB.identifier);
                        let cargarM3U: any = await commandCargarM3UDevice.command(comando);

                        if(cargarM3U.ok === false){ 

                            let data = {
                                device: deviceDB.identifier,
                                ok: false,                               
                            }
                            respDevice.push(data);

                        }else{

                            let data = {
                                device: deviceDB.identifier,
                                ok: true,                               
                            }
                            respDevice.push(data);


                        }

                        
                    }
 
                    console.log(respDevice)
                                      
                    res.json({
                        ok: true,
                        msg: 'Terminó el proceso de sincronización',
                        resp: respDevice,
                        
                    });
            
        } catch (error) {

            return res.status(500).json({
                ok: false,
                msg: 'Error al añadir, intentalo nuevamente.',
                error
            });
            
        }        

    }


    async deletePlayListDevice(req: Request, res: Response){

        let {playList, device }  = req.params;


            if(!isValidObjectId(playList) || !isValidObjectId(device)){
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición2.'
                });
            }

         try {

                const data = {
                    $pull:{playLists:{playlist: playList }},
                }

                //TODO ELIMINAR TAREAS DEL DISPOSITIVO CON ESTA PLAYLIST

                const diveceDB =  await deviceModel.findByIdAndUpdate(device, data );
                if(!diveceDB){
                    return res.status(403).json({
                        ok: false,
                        msg:'No se pudo quitar la playList del dispositivo.'
                    });
                }


                res.json({
                    ok: true,
                    msg: 'Canción quitada con éxito',
                });

             
         } catch (error) {

            return res.status(500).json({
                ok: false,
                msg: 'Error! No se pudo quitar la playList del dispositivo. Intentalo nuevamente.',
                error
            });
             
         }

    }




    async statusDeviceAzure(req: Request, res: Response){ // estado actual del dispositivo

        console.log('Entro al estadoi')
        let device = req.query.device;

        if(!isValidObjectId(device)){
           return res.status(401).json({
               ok: false,
               msg: 'Dispositivo incorrecto'
           });
        }

        try {

            let deviceDB = await deviceModel.findById(device);
            if(!deviceDB){
                return res.status(404).json({
                    ok: false,
                    msg: 'El dispositivo no existe'
                });
            }

            let commandDeviceClass = new CommandDeviceClass(deviceDB.identifier);
            let status: any = await commandDeviceClass.deviceStatus();

            if(!status.ok){

                return res.status(401).json({
                    ok: false,
                    msg: 'No es posible consultar el estado del dispositivo en este momento.',
                    err: status.err
                })

            }

            return res.json({
                ok: true,
                info: status.info
            });

 
        } catch (error) {

            return res.status(500).json({
                ok: false,
                msg: 'No es posible consultar el estado del dispositivo en este momento.',
                err: error
            })
            
        }
        

    }



    ///////////////////////////////

    async mpcAzure(req: Request, res: Response){ // consulta comando mpc

        let {device, command}: any = req.query;

        if(!isValidObjectId(device) || !command){
           return res.status(401).json({
               ok: false,
               msg: 'Error datos incompletos o errados'
           });
        }

        try {

            let deviceDB = await deviceModel.findById(device);
            if(!deviceDB){
                return res.status(404).json({
                    ok: false,
                    msg: 'El dispositivo no existe'
                });
            }

            let commandDeviceClass = new CommandDeviceClass(deviceDB.identifier);
            let status: any = await commandDeviceClass.commandMpc(command);

             console.log('Lo que está retornando',  status);

            if(!status.ok){

                console.log('El status es false');

                return res.status(401).json({
                    ok: false,
                    msg: 'No es posible la conexión con el dispositivo en este momento ',
                    err: status.err
                })

            }

            return res.json({
                ok: true,
                info: status.info
            });

 
        } catch (error) {

        

            return res.status(500).json({
                ok: false,
                msg: 'No es posible consultar el estado del dispositivo en este momento.',
                err: error
            })
            
        }
        

    }


    async commandAzure(req: Request, res: Response){  // comandos diferentes del nativo mpc

        let {device, command}: any = req.query;

        if(!isValidObjectId(device) || !command){
           return res.status(401).json({
               ok: false,
               msg: 'Error datos incompletos o errados'
           });
        }

        try {

            let deviceDB = await deviceModel.findById(device);
            if(!deviceDB){
                return res.status(404).json({
                    ok: false,
                    msg: 'El dispositivo no existe'
                });
            }

            let commandDeviceClass = new CommandDeviceClass(deviceDB.identifier);
            let status: any = await commandDeviceClass.command(command);

             console.log('Llega', status);

            if(!status.ok){

                return res.status(401).json({
                    ok: false,
                    msg: 'No es posible la conexión con el dispositivo en este momento ',
                    err: status.err
                })

            }

            return res.json({
                ok: true,
                info: status.response
            });

 
        } catch (error) {

            return res.status(500).json({
                ok: false,
                msg: 'No es posible consultar el estado del dispositivo en este momento.',
                err: error
            })
            
        }

    }



    async programTask(req: Request, res: Response){  // programar una tarea

        //@ts-ignore
        let userId = req.uid;

        let {device}: any = req.query;
        let {
              title, description, playList, startDate, startHour, endDate, endHour, shuffle, repeat, random
        }  = req.body;  
                      
              
        if(!isValidObjectId(device) || !isValidObjectId(playList)){
                return res.status(401).json({
                    ok: false,
                    msg: 'Error datos incompletos o errados'
                });
        }


        try {

            let deviceDB = await deviceModel.findById(device);
            if(!deviceDB){
                return res.status(404).json({
                    ok: false,
                    msg: 'El dispositivo no existe'
                });
            }

          

            let formatoHoraFecha1 = FormatHour(startHour, startDate);
            let formatoHoraFecha2 = FormatHour(endHour,endDate);


            let data = {
                title, 
                description, 
                device,
                playList, 
                startDate : startDate, 
                startHour, 
                endDate: endDate, 
                endHour,
                startDateUnix: formatoHoraFecha1.fechaUnix,
                endDateUnix: formatoHoraFecha2.fechaUnix,
                user: userId,
                shuffle, 
                repeat, 
                random
            }

            
            if(data.startDateUnix >= data.endDateUnix){
                return res.status(401).json({
                    ok: false,
                    msg: 'La fecha inicial no pueden ser Superior o igual a la fecha final.'
                });
            }
            
             let createTask = await taskModel.create(data);
             if(!createTask){
                 return res.status(400).json({
                     ok: false,
                     msg:'No se pudo crear la tarea, intentalo nuevamente'
                 });
             }


             let comando = `program add ${createTask.taskNumber},${playList}.m3u,${data.startDateUnix},${data.endDateUnix},${shuffle},${repeat},${random}`

             let commandDeviceClass = new CommandDeviceClass(deviceDB.identifier);
             let status: any = await commandDeviceClass.command(comando);

             
             if(!status.ok){


                console.log('La que hay que borrar', createTask._id);
                let removeTask = await taskModel.findByIdAndDelete(createTask._id);

                 return res.status(401).json({
                     ok: false,
                     msg: 'No es posible la conexión con el dispositivo en este momento, intentalo de nuevo. ',
                     err: status.err
                 })

             }

             return res.json({
               
                    ok: true,
                    info: status.response
             });
            

        }catch(err){ 

            return res.status(500).json({
               
                 err,
                 msg: 'Ey! algo pasó intentalo nuevamente'

             });

        }
        
        
    
    } 


    async getTaskNumber(req: Request, res: Response){

        let numberTask = Number(req.params.numerTask);
        let device = req.query.device

        
        if(Number(numberTask) < 1 || !numberTask){
            return res.status(401).json({
                ok: false,
                msg: 'Número de tarea erroneo.'
            });
        }

        let taskDB = await taskModel.findOne({taskNumber: numberTask});
        if(!taskDB){
            return res.status(400).json({
                ok: false,
                msg: 'tarea no encontrada.'
            });
        }
        if(String(taskDB.device) !== String(device)){
            return res.status(401).json({
                ok: true,
                msg: 'Ey! ocurrio un error, intentalo de nuevo.'
            })
        }

        return res.json({
            ok: true,
            task: taskDB
        })

    }



    async updateprogramTask(req: Request, res: Response){

                //@ts-ignore
                let task = req.params.task;
                let device = req.query.device;

                let {

                      title, description, playList, startDate, startHour, endDate, endHour, shuffle, repeat, random

                }  = req.body;  
                              
                      
                if(!isValidObjectId(playList) || !isValidObjectId(task) ){
                        return res.status(401).json({
                            ok: false,
                            msg: 'Error datos incompletos o errados'
                        });
                }
        
        
                try {
        
                    let taskDB = await taskModel.findById(task);
                    if(!taskDB){
                        return res.status(404).json({
                            ok: false,
                            msg: 'La tarea no existe'
                        });
                    }

                    if(String(taskDB.device) !== String(device)){
                        return res.status(401).json({
                            ok: true,
                            msg: 'Ey! ocurrio un error, intentalo de nuevo.'
                        })
                    }

                    let deviceDB: any = await deviceModel.findById(device);
                    if(!taskDB){
                        return res.status(404).json({
                            ok: false,
                            msg: 'El dispoositivo no existe'
                        });
                    }  
                    
        
                    let data: any = {
                        title, 
                        description, 
                        device,
                        playList, 
                        startDate, 
                        startHour, 
                        endDate, 
                        endHour,
                        startDateUnix: taskDB.startDateUnix,
                        endDateUnix: taskDB.endDateUnix,
                        shuffle, 
                        repeat, 
                        random
                    }

                    if(startDate !== taskDB.startDate || endDate !== taskDB.endDate || startHour!== taskDB.startHour || endHour !== taskDB.endHour || String(playList) !== String(taskDB.playList) ){


                        let formatoHoraFecha1 = FormatHour(startHour, startDate);
                        let formatoHoraFecha2 = FormatHour(endHour,endDate);
                        data.startDateUnix = formatoHoraFecha1.fechaUnix;
                        data.endDateUnix = formatoHoraFecha2.fechaUnix;

                        if(data.startDateUnix >= data.endDateUnix){
                            return res.status(401).json({
                                ok: false,
                                msg: 'La fecha inicial no pueden ser Superior o igual a la fecha final.'
                            });
                        }



                        let command = `program remove ${taskDB.taskNumber}`;
                        let commandDeviceClass = new CommandDeviceClass(deviceDB.identifier);
                        let statusRemove: any = await commandDeviceClass.command(command);
    
                        if(!statusRemove.ok){
            
                            return res.status(401).json({
                                ok: false,
                                msg: 'No es posible la conexión con el dispositivo en este momento ',
                                err: statusRemove.err
                            })
           
                        }
            
                       
                         let comando = `program add ${taskDB.taskNumber},${playList}.m3u,${data.startDateUnix},${data.endDateUnix},${shuffle},${repeat},${random}`
                         let commandDeviceAdd = new CommandDeviceClass(deviceDB.identifier);
                         let status: any = await commandDeviceAdd.command(comando);
      
                         if(!status.ok){
            
                             return res.status(401).json({
                                 ok: false,
                                 msg: 'No es posible la conexión con el dispositivo en este momento ',
                                 err: status.err
                             })
            
                         }


                         let editar = await taskModel.findByIdAndUpdate(taskDB._id, data);                     
        
                         return res.json({
                           
                                ok: true,
                                device: true,
                                infoRemove: statusRemove.response, 
                                info: status.response,
                                msg: 'Datos Editados conexito'
                         });



                    }


                    let editar = await taskModel.findByIdAndUpdate(taskDB._id, data);                     
        
                    return res.json({
                      
                           ok: true,
                           device: false,
                           msg: 'Datos Editados conexito'
                    });
         




                    
        
                }catch(err){ 
        console.log(err)
                    return res.status(500).json({
                         
                         err,
                         msg: 'Ey! algo pasó intentalo nuevamente'
        
                     });
        
                }


    }



    async deleteProgramTask(req: Request, res: Response) {


         let {device}: any = req.params;
         let taskId = req.body.task;

         if(!isValidObjectId(device) || !isValidObjectId(taskId)){
            return res.status(401).json({
                ok: false,
                msg: 'Error datos incompletos o errados'
            });
         }

        try {

                let deviceDB = await deviceModel.findById(device);
                if(!deviceDB){
                    return res.status(404).json({
                        ok: false,
                        msg: 'La tarea no existe'
                    });
                }

                let taskDB = await taskModel.findById(taskId);
                if(!taskDB){
                    return res.status(404).json({
                        ok: false,
                        msg: 'La tarea no existe'
                    });
                }      

                
                let comando = `program remove ${taskDB.taskNumber}`;
                let commandDeviceClass = new CommandDeviceClass(deviceDB.identifier);
                let status: any = await commandDeviceClass.command(comando);


                if(!status.ok){

                    return res.status(401).json({
                        ok: false,
                        msg: 'No es posible la conexión con el dispositivo en este momento ',
                        err: status.err
                    })

                }

                if(String(taskDB.device) !== String(device)){
                    return res.status(401).json({
                        ok: true,
                        msg: 'Ey! ocurrio un error, intentalo de nuevo.'
                    })
                }

                let deleteTask = await taskModel.findByIdAndDelete(taskId);

                    return res.json({                
                            ok: true,
                            msg: 'tarea eliminada con éxito',
                            info: status.response
                });
             
 
         }catch(err){ 
 
             return res.status(500).json({
                
                  err,
                  msg: 'Ey! algo pasó intentalo nuevamente'
 
              });
 
         }

    }



    getProgramTask(req: Request, res: Response){


        let {device}: any = req.query;
        if(!isValidObjectId(device)){
            return res.status(400).json({
                ok: false,
                msg:'Device erroneo',
            })
        }


        const today = moment(new HoraConfig().horaMenosCinco).unix(); // actual
        const treeYear = moment(new HoraConfig().horaMenosCinco).add(3,'year').unix(); // dentro de 3 años


        let itemsPerPage = Number(req.query.items) || 30;
        let pagina = Number(req.query.page) || 1;
            pagina = Number(pagina - 1);

            let desde = pagina * itemsPerPage;
                desde = Number(desde);

        taskModel.find({$and:[{device}, {startDateUnix: {$gte: today}}, {startDateUnix: {$lt: treeYear}}]})
        .populate('playList') 
        .sort({startDateUnix: 1})
        .skip(desde)
        .limit(itemsPerPage)
        .exec((err: any, tasks: any) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }
            
            taskModel.countDocuments({$and:[{device}, {startDateUnix: {$gte: today}}, {startDateUnix: {$lt: treeYear}}]}, (err, count) => {


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
                    tasks
                });

            });

        });

    }


    searchProgramTask(req: Request, res: Response) {

        let termino = req.params.term;
        let device =req.params.device;

        if(!isValidObjectId(device)){
            return res.status(401).json({
                ok: false,
                msg: 'dato device erroneo.'
            })
        }

        let regex = new RegExp(termino, 'i');
        if(!termino){
            return;
        }

        let consult: any = {$and:[{device}, {$or:[{title: regex},{description: regex}]}]}; 
        taskModel.find(consult)
        .limit(30)
        .exec((err, tasks) =>{

            if(err){
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }

            return res.json({
                ok: true,
                tasks
            });

        });

    }



    async getDevicesAzure(req: Request, res: Response){

        let comando = req.body.comando; 

        let header: any = {
            'Authorization':  tokenAzure,
        };

        try {

                let resp = await axios.post(`${config.urlApiAzure}/devices?api-version=1.0`, {request: "mpc "+comando}, {headers: header});
             
                res.json({
                     response: resp
                });          
        
        } catch (error: any) {
           
                 res.status(500).json({
                     error
                 });         
        }


    }


    status(req: Request, res: Response) {


    }



}


function FormatHour (hour: string, date: string){

    console.log('Entra',hour,date )

    let hm = [
        {h:'1', hm: '13'},{h:'2', hm: '14'},{h:'3', hm: '15'},{h:'4', hm: '16'},{h:'5', hm: '17'},{h:'6', hm: '18'},{h:'7', hm: '19'},{h:'8', hm: '20'},{h:'9', hm: '21'},{h:'10', hm: '22'},{h:'11', hm: '23'},{h:'12', hm: '12'},{h:'01', hm: '13'},{h:'02', hm: '14'},{h:'03', hm: '15'},{h:'04', hm: '16'},{h:'05', hm: '17'},{h:'06', hm: '18'},{h:'07', hm: '19'},{h:'08', hm: '20'},{h:'09', hm: '21'},{h:'10', hm: '22'},{h:'11', hm: '23'}
    ];


    const quitFormatHour = hour.split(' ');
    const formatHour = quitFormatHour[quitFormatHour.length -1]; // formato hora 'AM  PM'
    let hour1 = quitFormatHour[0]; 'HOra ej 1:55'

    let cortarHora = hour1.split(':');
    let horaIni: any = cortarHora[0]; // hora sola ej 12
    let minuto  = cortarHora[1];

    // let separarFecha = date.split('/');
    // let anio = separarFecha[2];
    // let mes = separarFecha[0];
    // let dia = separarFecha[1];

    // if(Number(separarFecha[0]) < 10){
    //     mes = `0${separarFecha[0]}`;
    // }
    // if(Number(separarFecha[1]) < 10){
    //     dia = `0${separarFecha[1]}`;
    // }
    if(Number(horaIni) < 10){
        horaIni = `0${horaIni}`;
    }

    // let fechaFormateada = anio+'-'+mes+'-'+dia;

    if(formatHour === 'PM') { 

        // console.log('La que va a buscar', horaIni);  

        let buscarHora = hm.find(result => result.h === horaIni);
        // console.log('Hola Encontrada', buscarHora?.hm)  
        if(!buscarHora){
            console.log('¿Hora no existe');
        }
        horaIni = `${buscarHora?.hm}`;
        // let horaFormato = moment(fechaFormateada).format(`YYYY-MM-DDT${horaIni}:${minuto}:00`);
        let horaFormato = moment(date).format(`YYYY-MM-DDT${horaIni}:${minuto}:00`);


        let fechaUnix = moment(horaFormato).add(5,'hour').unix();
        // console.log('unixPM',fechaUnix)
        // console.log('FechaPM',horaFormato)
        return {
            fechaUnix: fechaUnix,       
        }

    }
    console.log('Entro a AM')

    if(horaIni === '12'){
        horaIni === '00';
    }

    console.log(`YYYY-MM-DDT${horaIni}:${minuto}:00`)   

    // console.log('fECHA fORMATEADA', fechaFormateada ); 

    let horaFormato = moment(date).format(`YYYY-MM-DDT${horaIni}:${minuto}:00`);
    console.log('hOPRA FORMATO', horaFormato)
    let fechaUnix = moment(horaFormato).add(5,'hour').unix();
    console.log('unixAM',fechaUnix)
    console.log('FechaAM',horaFormato)
    return {
        fechaUnix,
    }
 




}