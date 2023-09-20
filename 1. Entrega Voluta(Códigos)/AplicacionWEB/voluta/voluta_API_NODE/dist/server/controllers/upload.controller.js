"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = require("mongoose");
const actualizar_archivo_1 = require("../helpers/actualizar-archivo");
const { v4: uuidv4 } = require('uuid');
moment_1.default.locale('es');
class UploadController {
    uploadImage(req, res) {
        //@ts-ignore
        const uid = req.uid;
        //@ts-ignore
        const user = req.userDB; // userDB dato que se asigna en el middleware all
        const { id, type } = req.params; // _id y tipo  user, artista ó album
        if (!id || !mongoose_1.isValidObjectId(id)) {
            return res.status(400).json({
                ok: false,
                msg: 'id invalido'
            });
        }
        // validar tipos de path
        const tiposValidos = ['playLists', 'users'];
        if (!tiposValidos.includes(type)) {
            return res.status(400).json({
                ok: false,
                msg: 'No es tipo permitida'
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
        const file = req.files.upload;
        const nombreCortado = file.name.split('.');
        const extensionArchivo = nombreCortado[nombreCortado.length - 1];
        const extensionesValidas = ['png', 'jpg', 'jpeg', 'gif', 'm3u'];
        if (!extensionesValidas.includes(extensionArchivo)) {
            return res.status(400).json({
                ok: false,
                msg: 'No es una extensión permitida'
            });
        }
        const nombre = `${id}.${extensionArchivo}`;
        //path para guardar imagen;
        const path = `./dist/server/uploads/${type}/${nombre}`;
        //mover la imagen
        file.mv(path, (err) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                    msg: 'Error al mover la imagen'
                });
            }
            //actualizar DB
            actualizar_archivo_1.actualizarArchivo(type, id, nombre);
            return res.json({
                ok: true,
                msg: 'Archivo subido',
                upload: nombre
            });
        });
    }
    uploadSong(req, res) {
        const { id } = req.params; // _id song
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
            actualizar_archivo_1.actualizarArchivoSong(id, nombreArchivo);
            return res.json({
                ok: true,
                msg: 'Archivo subido',
                nameSong: nombreArchivo
            });
        });
    }
    returnImage(req, res) {
        const { type, img } = req.params;
        const pathImg = path_1.default.join(__dirname, `../uploads/${type}/${img}`);
        if (fs_1.default.existsSync(pathImg)) {
            res.sendFile(pathImg);
        }
        else {
            const pathImg = path_1.default.join(__dirname, `../uploads/no-img.jpg`);
            res.sendFile(pathImg);
        }
    }
}
exports.default = UploadController;
