"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceController = void 0;
const device_model_1 = __importDefault(require("../models/device.model"));
const mongoose_1 = require("mongoose");
const config_1 = require("../config/config");
const axios_1 = __importDefault(require("axios"));
const commandDevice_class_1 = require("../classes/commandDevice.class");
const task_model_1 = __importDefault(require("../models/task.model"));
const moment_1 = __importDefault(require("moment"));
const hora_1 = require("../config/hora");
const crearM3U_1 = require("../helpers/crearM3U");
class DeviceController {
    createDevice(req, res) {
        //@ts-ignore
        let userId = req.uid;
        let { name, identifier, description, location } = req.body;
        let data = { name, identifier, description, location, user: userId };
        device_model_1.default.create(data, (err, device) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }
            if (!device) {
                return res.status(404).json({
                    ok: false,
                    msg: 'El dispositivo no se pudo crear, intentalo nuevamente.'
                });
            }
            return res.json({
                ok: true,
                msg: 'Dispositivo creado con éxito.',
                device
            });
        });
    }
    getdevice(req, res) {
        let deviceId = req.params.id;
        if (!mongoose_1.isValidObjectId(deviceId)) {
            return res.status(500).json({
                ok: false,
                msg: 'Error en la petición.'
            });
        }
        device_model_1.default.findById(deviceId)
            .populate('playLists.playlist')
            .exec((err, device) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.',
                    err
                });
            }
            if (!device) {
                return res.status(404).json({
                    ok: false,
                    msg: 'El dispositivo no existe.'
                });
            }
            return res.json({
                ok: true,
                device
            });
        });
    }
    getdevices(req, res) {
        let itemsPerPage = Number(req.query.items) || 30;
        let pagina = Number(req.query.page) || 1;
        pagina = Number(pagina - 1);
        let desde = pagina * itemsPerPage;
        desde = Number(desde);
        device_model_1.default.find({})
            // .populate('playLists.playList') 
            .sort({ createdAt: -1 })
            .skip(desde)
            .limit(itemsPerPage)
            .exec((err, device) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }
            device_model_1.default.countDocuments((err, count) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        msg: 'Error en la petición.'
                    });
                }
                return res.json({
                    ok: true,
                    total: count,
                    total_pages: Math.ceil(count / itemsPerPage),
                    page: pagina + 1,
                    device
                });
            });
        });
    }
    updatedevice(req, res) {
        let deviceId = req.params.id;
        let { name, identifier, description, location } = req.body;
        if (!mongoose_1.isValidObjectId(deviceId)) {
            return res.status(500).json({
                ok: false,
                msg: 'Error en la petición.'
            });
        }
        let data = { name, identifier, description, location };
        device_model_1.default.findByIdAndUpdate(deviceId, data, { new: true }, (err, device) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }
            if (!device) {
                return res.status(404).json({
                    ok: false,
                    msg: 'El dispositivo no existe.'
                });
            }
            return res.json({
                ok: true,
                msg: 'Dispositivo actualizado con éxito.',
                device
            });
        });
    }
    deletedevice(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let deviceId = req.params.device;
            if (!mongoose_1.isValidObjectId(deviceId)) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Dispositivo invalido'
                });
            }
            const today = moment_1.default(new hora_1.HoraConfig().horaMenosCinco).unix(); // actual                  
            let validatePlayListTask = yield task_model_1.default.find({ device: deviceId, startDateUnix: { $gt: today } });
            if (validatePlayListTask.length > 0) {
                return res.status(401).json({
                    ok: true,
                    msg: 'El dispositivo cuenta con tareas programadas, para eliminarlo debes cancelarlas todas'
                });
            }
            yield task_model_1.default.deleteMany({ device: deviceId });
            yield device_model_1.default.findByIdAndDelete(deviceId);
            return res.json({
                ok: true,
                msg: 'Dispositivo eliminado con éxito.'
            });
        });
    }
    searchdevice(req, res) {
        let termino = req.params.term;
        let regex = new RegExp(termino, 'i');
        if (!termino) {
            return;
        }
        device_model_1.default.find({ $or: [{ name: regex }, { description: regex }, { identifier: regex }, { location: regex }] })
            .limit(30)
            .exec((err, devices) => {
            if (err) {
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
    addPlayListDevice(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let deviceID = req.params.device;
            let playListID = req.body.playList;
            if (!mongoose_1.isValidObjectId(playListID) || !mongoose_1.isValidObjectId(deviceID)) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }
            try {
                let validateDevice = yield device_model_1.default.findById(deviceID);
                if (!validateDevice) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'El dispositivo no existe.'
                    });
                }
                // let playListExist = deviceModel.findOne( {_id: playListID }, {playLists: {$all: [playList]}, hobbies: {$in:
                //     ["footing", "baloncesto"]}} 
                // let obectId: any =  new mongoose.Types.ObjectId(playListID)  
                // console.log('Convertido a string', console.log(obectId)); 
                let playListExist = validateDevice.playLists.find(playList => String(playList.playlist) === playListID);
                if (playListExist) {
                    return res.json({
                        ok: false,
                        msg: 'Ey!! La playList ya se encuentra agregada en el dispositivo.'
                    });
                }
                let addPlayList = yield device_model_1.default.findByIdAndUpdate(deviceID, { $push: { playLists: { playlist: playListID } } }, { new: true });
                if (!addPlayList) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'Error!  el playList no se pudo añadir al dispositivo.'
                    });
                }
                //Ultimo
                let comando = `download ${config_1.urlServerUpload}/v1/upload/playLists/${playListID}.m3u`; // comando con ruta desde donde el dispositivo debe descargar la playList
                let commandCargarM3UDevice = new commandDevice_class_1.CommandDeviceClass(validateDevice.identifier);
                let cargarM3U = yield commandCargarM3UDevice.command(comando);
                if (cargarM3U.ok === false) { // si el dispositivo no recibe el comando eliminamos la playList
                    const data = {
                        $pull: { playLists: { playlist: playListID } },
                    };
                    const diveceDB = yield device_model_1.default.findByIdAndUpdate(validateDevice._id, data);
                    return res.json({
                        ok: false,
                        msg: 'Ey! no se ha podido sincronizar con el dispositivo, intentalo nuevamente.',
                        respDisp: cargarM3U
                    });
                }
                res.json({
                    ok: true,
                    msg: 'PlayList añadida con éxito',
                    resp: addPlayList,
                    respDisp: cargarM3U
                });
            }
            catch (error) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error al añadir, intentalo nuevamente.',
                    error
                });
            }
        });
    }
    syncUpAddPlayListDevices(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let playListID = req.params.playlist;
            if (!mongoose_1.isValidObjectId(playListID)) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }
            try {
                //@ts-ignore
                yield crearM3U_1.crearM3U(playListID, req.tk);
                let respDevice = [];
                let devices = yield device_model_1.default.find({ 'playLists.playlist': playListID });
                if (devices.length < 1) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'La play list no se encuentra asociada a ningún dispositivo'
                    });
                }
                for (let d of devices) {
                    let deviceDB = yield device_model_1.default.findById(d._id);
                    //Ultimo
                    let comando = `download ${config_1.urlServerUpload}/v1/upload/playLists/${playListID}.m3u`; // comando con ruta desde donde el dispositivo debe descargar la playList
                    let commandCargarM3UDevice = new commandDevice_class_1.CommandDeviceClass(deviceDB.identifier);
                    let cargarM3U = yield commandCargarM3UDevice.command(comando);
                    if (cargarM3U.ok === false) {
                        let data = {
                            device: deviceDB.identifier,
                            ok: false,
                        };
                        respDevice.push(data);
                    }
                    else {
                        let data = {
                            device: deviceDB.identifier,
                            ok: true,
                        };
                        respDevice.push(data);
                    }
                }
                console.log(respDevice);
                res.json({
                    ok: true,
                    msg: 'Terminó el proceso de sincronización',
                    resp: respDevice,
                });
            }
            catch (error) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error al añadir, intentalo nuevamente.',
                    error
                });
            }
        });
    }
    deletePlayListDevice(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { playList, device } = req.params;
            if (!mongoose_1.isValidObjectId(playList) || !mongoose_1.isValidObjectId(device)) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición2.'
                });
            }
            try {
                const data = {
                    $pull: { playLists: { playlist: playList } },
                };
                //TODO ELIMINAR TAREAS DEL DISPOSITIVO CON ESTA PLAYLIST
                const diveceDB = yield device_model_1.default.findByIdAndUpdate(device, data);
                if (!diveceDB) {
                    return res.status(403).json({
                        ok: false,
                        msg: 'No se pudo quitar la playList del dispositivo.'
                    });
                }
                res.json({
                    ok: true,
                    msg: 'Canción quitada con éxito',
                });
            }
            catch (error) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error! No se pudo quitar la playList del dispositivo. Intentalo nuevamente.',
                    error
                });
            }
        });
    }
    statusDeviceAzure(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Entro al estadoi');
            let device = req.query.device;
            if (!mongoose_1.isValidObjectId(device)) {
                return res.status(401).json({
                    ok: false,
                    msg: 'Dispositivo incorrecto'
                });
            }
            try {
                let deviceDB = yield device_model_1.default.findById(device);
                if (!deviceDB) {
                    return res.status(404).json({
                        ok: false,
                        msg: 'El dispositivo no existe'
                    });
                }
                let commandDeviceClass = new commandDevice_class_1.CommandDeviceClass(deviceDB.identifier);
                let status = yield commandDeviceClass.deviceStatus();
                if (!status.ok) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'No es posible consultar el estado del dispositivo en este momento.',
                        err: status.err
                    });
                }
                return res.json({
                    ok: true,
                    info: status.info
                });
            }
            catch (error) {
                return res.status(500).json({
                    ok: false,
                    msg: 'No es posible consultar el estado del dispositivo en este momento.',
                    err: error
                });
            }
        });
    }
    ///////////////////////////////
    mpcAzure(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { device, command } = req.query;
            if (!mongoose_1.isValidObjectId(device) || !command) {
                return res.status(401).json({
                    ok: false,
                    msg: 'Error datos incompletos o errados'
                });
            }
            try {
                let deviceDB = yield device_model_1.default.findById(device);
                if (!deviceDB) {
                    return res.status(404).json({
                        ok: false,
                        msg: 'El dispositivo no existe'
                    });
                }
                let commandDeviceClass = new commandDevice_class_1.CommandDeviceClass(deviceDB.identifier);
                let status = yield commandDeviceClass.commandMpc(command);
                console.log('Lo que está retornando', status);
                if (!status.ok) {
                    console.log('El status es false');
                    return res.status(401).json({
                        ok: false,
                        msg: 'No es posible la conexión con el dispositivo en este momento ',
                        err: status.err
                    });
                }
                return res.json({
                    ok: true,
                    info: status.info
                });
            }
            catch (error) {
                return res.status(500).json({
                    ok: false,
                    msg: 'No es posible consultar el estado del dispositivo en este momento.',
                    err: error
                });
            }
        });
    }
    commandAzure(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { device, command } = req.query;
            if (!mongoose_1.isValidObjectId(device) || !command) {
                return res.status(401).json({
                    ok: false,
                    msg: 'Error datos incompletos o errados'
                });
            }
            try {
                let deviceDB = yield device_model_1.default.findById(device);
                if (!deviceDB) {
                    return res.status(404).json({
                        ok: false,
                        msg: 'El dispositivo no existe'
                    });
                }
                let commandDeviceClass = new commandDevice_class_1.CommandDeviceClass(deviceDB.identifier);
                let status = yield commandDeviceClass.command(command);
                console.log('Llega', status);
                if (!status.ok) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'No es posible la conexión con el dispositivo en este momento ',
                        err: status.err
                    });
                }
                return res.json({
                    ok: true,
                    info: status.response
                });
            }
            catch (error) {
                return res.status(500).json({
                    ok: false,
                    msg: 'No es posible consultar el estado del dispositivo en este momento.',
                    err: error
                });
            }
        });
    }
    programTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //@ts-ignore
            let userId = req.uid;
            let { device } = req.query;
            let { title, description, playList, startDate, startHour, endDate, endHour, shuffle, repeat, random } = req.body;
            if (!mongoose_1.isValidObjectId(device) || !mongoose_1.isValidObjectId(playList)) {
                return res.status(401).json({
                    ok: false,
                    msg: 'Error datos incompletos o errados'
                });
            }
            try {
                let deviceDB = yield device_model_1.default.findById(device);
                if (!deviceDB) {
                    return res.status(404).json({
                        ok: false,
                        msg: 'El dispositivo no existe'
                    });
                }
                let formatoHoraFecha1 = FormatHour(startHour, startDate);
                let formatoHoraFecha2 = FormatHour(endHour, endDate);
                let data = {
                    title,
                    description,
                    device,
                    playList,
                    startDate: startDate,
                    startHour,
                    endDate: endDate,
                    endHour,
                    startDateUnix: formatoHoraFecha1.fechaUnix,
                    endDateUnix: formatoHoraFecha2.fechaUnix,
                    user: userId,
                    shuffle,
                    repeat,
                    random
                };
                if (data.startDateUnix >= data.endDateUnix) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'La fecha inicial no pueden ser Superior o igual a la fecha final.'
                    });
                }
                let createTask = yield task_model_1.default.create(data);
                if (!createTask) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'No se pudo crear la tarea, intentalo nuevamente'
                    });
                }
                let comando = `program add ${createTask.taskNumber},${playList}.m3u,${data.startDateUnix},${data.endDateUnix},${shuffle},${repeat},${random}`;
                let commandDeviceClass = new commandDevice_class_1.CommandDeviceClass(deviceDB.identifier);
                let status = yield commandDeviceClass.command(comando);
                if (!status.ok) {
                    console.log('La que hay que borrar', createTask._id);
                    let removeTask = yield task_model_1.default.findByIdAndDelete(createTask._id);
                    return res.status(401).json({
                        ok: false,
                        msg: 'No es posible la conexión con el dispositivo en este momento, intentalo de nuevo. ',
                        err: status.err
                    });
                }
                return res.json({
                    ok: true,
                    info: status.response
                });
            }
            catch (err) {
                return res.status(500).json({
                    err,
                    msg: 'Ey! algo pasó intentalo nuevamente'
                });
            }
        });
    }
    getTaskNumber(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let numberTask = Number(req.params.numerTask);
            let device = req.query.device;
            if (Number(numberTask) < 1 || !numberTask) {
                return res.status(401).json({
                    ok: false,
                    msg: 'Número de tarea erroneo.'
                });
            }
            let taskDB = yield task_model_1.default.findOne({ taskNumber: numberTask });
            if (!taskDB) {
                return res.status(400).json({
                    ok: false,
                    msg: 'tarea no encontrada.'
                });
            }
            if (String(taskDB.device) !== String(device)) {
                return res.status(401).json({
                    ok: true,
                    msg: 'Ey! ocurrio un error, intentalo de nuevo.'
                });
            }
            return res.json({
                ok: true,
                task: taskDB
            });
        });
    }
    updateprogramTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //@ts-ignore
            let task = req.params.task;
            let device = req.query.device;
            let { title, description, playList, startDate, startHour, endDate, endHour, shuffle, repeat, random } = req.body;
            if (!mongoose_1.isValidObjectId(playList) || !mongoose_1.isValidObjectId(task)) {
                return res.status(401).json({
                    ok: false,
                    msg: 'Error datos incompletos o errados'
                });
            }
            try {
                let taskDB = yield task_model_1.default.findById(task);
                if (!taskDB) {
                    return res.status(404).json({
                        ok: false,
                        msg: 'La tarea no existe'
                    });
                }
                if (String(taskDB.device) !== String(device)) {
                    return res.status(401).json({
                        ok: true,
                        msg: 'Ey! ocurrio un error, intentalo de nuevo.'
                    });
                }
                let deviceDB = yield device_model_1.default.findById(device);
                if (!taskDB) {
                    return res.status(404).json({
                        ok: false,
                        msg: 'El dispoositivo no existe'
                    });
                }
                let data = {
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
                };
                if (startDate !== taskDB.startDate || endDate !== taskDB.endDate || startHour !== taskDB.startHour || endHour !== taskDB.endHour || String(playList) !== String(taskDB.playList)) {
                    let formatoHoraFecha1 = FormatHour(startHour, startDate);
                    let formatoHoraFecha2 = FormatHour(endHour, endDate);
                    data.startDateUnix = formatoHoraFecha1.fechaUnix;
                    data.endDateUnix = formatoHoraFecha2.fechaUnix;
                    if (data.startDateUnix >= data.endDateUnix) {
                        return res.status(401).json({
                            ok: false,
                            msg: 'La fecha inicial no pueden ser Superior o igual a la fecha final.'
                        });
                    }
                    let command = `program remove ${taskDB.taskNumber}`;
                    let commandDeviceClass = new commandDevice_class_1.CommandDeviceClass(deviceDB.identifier);
                    let statusRemove = yield commandDeviceClass.command(command);
                    if (!statusRemove.ok) {
                        return res.status(401).json({
                            ok: false,
                            msg: 'No es posible la conexión con el dispositivo en este momento ',
                            err: statusRemove.err
                        });
                    }
                    let comando = `program add ${taskDB.taskNumber},${playList}.m3u,${data.startDateUnix},${data.endDateUnix},${shuffle},${repeat},${random}`;
                    let commandDeviceAdd = new commandDevice_class_1.CommandDeviceClass(deviceDB.identifier);
                    let status = yield commandDeviceAdd.command(comando);
                    if (!status.ok) {
                        return res.status(401).json({
                            ok: false,
                            msg: 'No es posible la conexión con el dispositivo en este momento ',
                            err: status.err
                        });
                    }
                    let editar = yield task_model_1.default.findByIdAndUpdate(taskDB._id, data);
                    return res.json({
                        ok: true,
                        device: true,
                        infoRemove: statusRemove.response,
                        info: status.response,
                        msg: 'Datos Editados conexito'
                    });
                }
                let editar = yield task_model_1.default.findByIdAndUpdate(taskDB._id, data);
                return res.json({
                    ok: true,
                    device: false,
                    msg: 'Datos Editados conexito'
                });
            }
            catch (err) {
                console.log(err);
                return res.status(500).json({
                    err,
                    msg: 'Ey! algo pasó intentalo nuevamente'
                });
            }
        });
    }
    deleteProgramTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { device } = req.params;
            let taskId = req.body.task;
            if (!mongoose_1.isValidObjectId(device) || !mongoose_1.isValidObjectId(taskId)) {
                return res.status(401).json({
                    ok: false,
                    msg: 'Error datos incompletos o errados'
                });
            }
            try {
                let deviceDB = yield device_model_1.default.findById(device);
                if (!deviceDB) {
                    return res.status(404).json({
                        ok: false,
                        msg: 'La tarea no existe'
                    });
                }
                let taskDB = yield task_model_1.default.findById(taskId);
                if (!taskDB) {
                    return res.status(404).json({
                        ok: false,
                        msg: 'La tarea no existe'
                    });
                }
                let comando = `program remove ${taskDB.taskNumber}`;
                let commandDeviceClass = new commandDevice_class_1.CommandDeviceClass(deviceDB.identifier);
                let status = yield commandDeviceClass.command(comando);
                if (!status.ok) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'No es posible la conexión con el dispositivo en este momento ',
                        err: status.err
                    });
                }
                if (String(taskDB.device) !== String(device)) {
                    return res.status(401).json({
                        ok: true,
                        msg: 'Ey! ocurrio un error, intentalo de nuevo.'
                    });
                }
                let deleteTask = yield task_model_1.default.findByIdAndDelete(taskId);
                return res.json({
                    ok: true,
                    msg: 'tarea eliminada con éxito',
                    info: status.response
                });
            }
            catch (err) {
                return res.status(500).json({
                    err,
                    msg: 'Ey! algo pasó intentalo nuevamente'
                });
            }
        });
    }
    getProgramTask(req, res) {
        let { device } = req.query;
        if (!mongoose_1.isValidObjectId(device)) {
            return res.status(400).json({
                ok: false,
                msg: 'Device erroneo',
            });
        }
        const today = moment_1.default(new hora_1.HoraConfig().horaMenosCinco).unix(); // actual
        const treeYear = moment_1.default(new hora_1.HoraConfig().horaMenosCinco).add(3, 'year').unix(); // dentro de 3 años
        let itemsPerPage = Number(req.query.items) || 30;
        let pagina = Number(req.query.page) || 1;
        pagina = Number(pagina - 1);
        let desde = pagina * itemsPerPage;
        desde = Number(desde);
        task_model_1.default.find({ $and: [{ device }, { startDateUnix: { $gte: today } }, { startDateUnix: { $lt: treeYear } }] })
            .populate('playList')
            .sort({ startDateUnix: 1 })
            .skip(desde)
            .limit(itemsPerPage)
            .exec((err, tasks) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }
            task_model_1.default.countDocuments({ $and: [{ device }, { startDateUnix: { $gte: today } }, { startDateUnix: { $lt: treeYear } }] }, (err, count) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        msg: 'Error en la petición.'
                    });
                }
                return res.json({
                    ok: true,
                    total: count,
                    total_pages: Math.ceil(count / itemsPerPage),
                    page: pagina + 1,
                    tasks
                });
            });
        });
    }
    searchProgramTask(req, res) {
        let termino = req.params.term;
        let device = req.params.device;
        if (!mongoose_1.isValidObjectId(device)) {
            return res.status(401).json({
                ok: false,
                msg: 'dato device erroneo.'
            });
        }
        let regex = new RegExp(termino, 'i');
        if (!termino) {
            return;
        }
        let consult = { $and: [{ device }, { $or: [{ title: regex }, { description: regex }] }] };
        task_model_1.default.find(consult)
            .limit(30)
            .exec((err, tasks) => {
            if (err) {
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
    getDevicesAzure(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let comando = req.body.comando;
            let header = {
                'Authorization': config_1.tokenAzure,
            };
            try {
                let resp = yield axios_1.default.post(`${config_1.config.urlApiAzure}/devices?api-version=1.0`, { request: "mpc " + comando }, { headers: header });
                res.json({
                    response: resp
                });
            }
            catch (error) {
                res.status(500).json({
                    error
                });
            }
        });
    }
    status(req, res) {
    }
}
exports.DeviceController = DeviceController;
function FormatHour(hour, date) {
    console.log('Entra', hour, date);
    let hm = [
        { h: '1', hm: '13' }, { h: '2', hm: '14' }, { h: '3', hm: '15' }, { h: '4', hm: '16' }, { h: '5', hm: '17' }, { h: '6', hm: '18' }, { h: '7', hm: '19' }, { h: '8', hm: '20' }, { h: '9', hm: '21' }, { h: '10', hm: '22' }, { h: '11', hm: '23' }, { h: '12', hm: '12' }, { h: '01', hm: '13' }, { h: '02', hm: '14' }, { h: '03', hm: '15' }, { h: '04', hm: '16' }, { h: '05', hm: '17' }, { h: '06', hm: '18' }, { h: '07', hm: '19' }, { h: '08', hm: '20' }, { h: '09', hm: '21' }, { h: '10', hm: '22' }, { h: '11', hm: '23' }
    ];
    const quitFormatHour = hour.split(' ');
    const formatHour = quitFormatHour[quitFormatHour.length - 1]; // formato hora 'AM  PM'
    let hour1 = quitFormatHour[0];
    'HOra ej 1:55';
    let cortarHora = hour1.split(':');
    let horaIni = cortarHora[0]; // hora sola ej 12
    let minuto = cortarHora[1];
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
    if (Number(horaIni) < 10) {
        horaIni = `0${horaIni}`;
    }
    // let fechaFormateada = anio+'-'+mes+'-'+dia;
    if (formatHour === 'PM') {
        // console.log('La que va a buscar', horaIni);  
        let buscarHora = hm.find(result => result.h === horaIni);
        // console.log('Hola Encontrada', buscarHora?.hm)  
        if (!buscarHora) {
            console.log('¿Hora no existe');
        }
        horaIni = `${buscarHora === null || buscarHora === void 0 ? void 0 : buscarHora.hm}`;
        // let horaFormato = moment(fechaFormateada).format(`YYYY-MM-DDT${horaIni}:${minuto}:00`);
        let horaFormato = moment_1.default(date).format(`YYYY-MM-DDT${horaIni}:${minuto}:00`);
        let fechaUnix = moment_1.default(horaFormato).add(5, 'hour').unix();
        // console.log('unixPM',fechaUnix)
        // console.log('FechaPM',horaFormato)
        return {
            fechaUnix: fechaUnix,
        };
    }
    console.log('Entro a AM');
    if (horaIni === '12') {
        horaIni === '00';
    }
    console.log(`YYYY-MM-DDT${horaIni}:${minuto}:00`);
    // console.log('fECHA fORMATEADA', fechaFormateada ); 
    let horaFormato = moment_1.default(date).format(`YYYY-MM-DDT${horaIni}:${minuto}:00`);
    console.log('hOPRA FORMATO', horaFormato);
    let fechaUnix = moment_1.default(horaFormato).add(5, 'hour').unix();
    console.log('unixAM', fechaUnix);
    console.log('FechaAM', horaFormato);
    return {
        fechaUnix,
    };
}
