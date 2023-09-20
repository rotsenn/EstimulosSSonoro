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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = require("mongoose");
const actualizar_archivo_1 = require("../helpers/actualizar-archivo");
const playList_model_1 = __importDefault(require("../models/playList.model"));
const config_1 = require("../config/config");
const user_model_1 = __importDefault(require("../models/user.model"));
const { v4: uuidv4 } = require('uuid');
moment_1.default.locale('es');
class UploadController {
    uploadArchivo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //@ts-ignore
            const uid = req.uid;
            //@ts-ignore
            const user = yield user_model_1.default.findById(uid); // userDB dato que se asigna en el middleware all
            const { id, type } = req.params; // _id y tipo  user, artista ó album
            if (!id || !mongoose_1.isValidObjectId(id)) {
                return res.status(400).json({
                    ok: false,
                    msg: 'id invalido'
                });
            }
            // validar tipos de path
            const tiposValidos = ['playListsIMG', 'users'];
            if (!tiposValidos.includes(type)) {
                return res.status(400).json({
                    ok: false,
                    msg: 'No es tipo permitido'
                });
            }
            if (type === 'users') { // Si tipo es usuario sólo puede editar su propia imagen
                if (id !== uid) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'No estás autorizado, avisaré a tus padres. '
                    });
                }
            }
            else {
                if (user.role === 'SUPER_ROLE' || user.role === 'ADMIN_ROLE') { }
                else {
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
            const file = req.files.image;
            const nombreCortado = file.name.split('.');
            const extensionArchivo = nombreCortado[nombreCortado.length - 1];
            const extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];
            if (!extensionesValidas.includes(extensionArchivo)) {
                return res.status(400).json({
                    ok: false,
                    msg: 'No es una extensión permitida'
                });
            }
            const nombreImagen = `${id}.${extensionArchivo}`;
            //path para guardar imagen;
            const path = `./dist/server/uploads/${type}/${nombreImagen}`;
            //mover la imagen
            file.mv(path, (err) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err,
                        msg: 'Error al mover la imagen 1'
                    });
                }
                //actualizar DB
                actualizar_archivo_1.actualizarImage(type, id, nombreImagen);
                return res.json({
                    ok: true,
                    msg: 'Archivo subido',
                    imageName: nombreImagen
                });
            });
        });
    }
    uploadSong(req, res) {
        const { id } = req.params; // _id song
        const duration = req.query.duration; // duración de la canción en segundos
        if (!id || !mongoose_1.isValidObjectId(id)) {
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
        const file = req.files.song;
        const nombreCortado = file.name.split('.');
        const extensionArchivo = nombreCortado[nombreCortado.length - 1];
        const extensionesValidas = ['mp3'];
        if (!extensionesValidas.includes(extensionArchivo)) {
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
        file.mv(path, (err) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                    msg: 'Error al mover archivo'
                });
            }
            //actualizar DB
            actualizar_archivo_1.actualizarArchivoSong(id, nombreArchivo, Number(duration));
            return res.json({
                ok: true,
                msg: 'Archivo subido',
                nameSong: nombreArchivo
            });
        });
    }
    returnArchivoM3U(req, res) {
        const { type, name } = req.params;
        if (type === 'songs' || type === 'playLists') { }
        else {
            return res.status(401).json({
                ok: false,
                msg: 'Tipo no valido'
            });
        }
        const pathImg = path_1.default.join(__dirname, `../../../dist/server/uploads/${type}/${name}`);
        console.log(pathImg);
        if (fs_1.default.existsSync(pathImg)) {
            console.log('Existeeee');
            res.sendFile(pathImg);
        }
        else {
            const pathImg = path_1.default.join(__dirname, `../../../dist/server/uploads/no-img.jpg`);
            res.sendFile(pathImg);
        }
    }
    returnArchivo(req, res) {
        const { type, name } = req.params;
        if (type === 'users' || type === 'playListsIMG' || type === 'playLists' || type === 'songs') { }
        else {
            return res.status(401).json({
                ok: false,
                msg: 'archivo invalido'
            });
        }
        const pathImg = path_1.default.join(__dirname, `../../../dist/server/uploads/${type}/${name}`);
        // console.log(pathImg) 
        if (fs_1.default.existsSync(pathImg)) {
            console.log('Existeeee');
            res.sendFile(pathImg);
        }
        else {
            const pathImg = path_1.default.join(__dirname, `../../../dist/server/uploads/no-img.jpg`);
            res.sendFile(pathImg);
        }
    }
    createM3U(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { playListID } = req.body;
            if (!mongoose_1.isValidObjectId(playListID)) {
                return res.status(500).json({
                    ok: false,
                    msg: 'PlayList invalido'
                });
            }
            try {
                let playListDB = yield playList_model_1.default.findById(playListID);
                if (!playListDB) {
                    return res.status(403).json({
                        ok: false,
                        msg: 'PlayList invalido'
                    });
                }
                let playList = '';
                playList += `#EXTM3U\n`;
                for (let p of playListDB.songs) {
                    console.log(p);
                    playList += `${config_1.uploadServer}/api/v1/upload/songs/${p.song}.mp3\n`;
                }
                fs_1.default.writeFile(`./dist/server/uploads/playLists/${playListID}.m3u`, playList, (err) => {
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
            }
            catch (error) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Upsss!  algo anda mal, intentalo nuevamente'
                });
            }
        });
    }
    uploadRemove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { type, name } = req.params;
            if (type === 'user' || type === 'playListsIMG' || type === 'playList' || type === 'song') { }
            else {
                return res.status(401).json({
                    ok: false,
                    msg: 'archivo invalido'
                });
            }
            let remove = yield actualizar_archivo_1.uploadRemove(type, name);
            if (!remove) {
                return res.json({
                    ok: false,
                    msg: 'No se pudo eliminar el archivo'
                });
            }
            return res.json({
                ok: true,
                msg: 'Archivo eliminado con éxito'
            });
        });
    }
}
exports.default = UploadController;
