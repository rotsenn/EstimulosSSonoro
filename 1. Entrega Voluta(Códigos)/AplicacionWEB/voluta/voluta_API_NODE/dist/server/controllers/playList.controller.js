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
exports.PlayListController = void 0;
const playList_model_1 = __importDefault(require("../models/playList.model"));
const mongoose_1 = require("mongoose");
const song_model_1 = __importDefault(require("../models/song.model"));
const crearM3U_1 = require("../helpers/crearM3U");
const commandDevice_class_1 = require("../classes/commandDevice.class");
const device_model_1 = __importDefault(require("../models/device.model"));
const deleteUpload_1 = require("../helpers/deleteUpload");
const task_model_1 = __importDefault(require("../models/task.model"));
class PlayListController {
    createPlayList(req, res) {
        //@ts-ignore
        let userId = req.uid;
        let { name, description, type } = req.body;
        let data = { name, description, type, user: userId };
        playList_model_1.default.create(data, (err, genre) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error al guardar, intentalo nuevamente.',
                    err
                });
            }
            if (!genre) {
                return res.status(404).json({
                    ok: false,
                    msg: 'La lista de reproducción no se pudo crear, intentalo nuevamente.'
                });
            }
            return res.json({
                ok: true,
                msg: 'Lista de reproducción creado con éxito.',
                genre
            });
        });
    }
    getPlayList(req, res) {
        let playListID = req.params.id;
        if (!mongoose_1.isValidObjectId(playListID)) {
            return res.status(500).json({
                ok: false,
                msg: 'Error en la petición.'
            });
        }
        playList_model_1.default.findById(playListID)
            .populate('songs.song')
            .exec((err, playList) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }
            if (!playList) {
                return res.status(404).json({
                    ok: false,
                    msg: 'La lista de reproducción no existe.'
                });
            }
            return res.json({
                ok: true,
                playList
            });
        });
    }
    getPlayLists(req, res) {
        let itemsPerPage = Number(req.query.items) || 30;
        let pagina = Number(req.query.page) || 1;
        pagina = Number(pagina - 1);
        let desde = pagina * itemsPerPage;
        desde = Number(desde);
        playList_model_1.default.find()
            .populate('songs.song')
            .skip(desde)
            .limit(itemsPerPage)
            .exec((err, playlists) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }
            playList_model_1.default.countDocuments((err, count) => {
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
                    playlists
                });
            });
        });
    }
    updatePlayList(req, res) {
        let playListID = req.params.id;
        let { name, description, type } = req.body;
        if (!mongoose_1.isValidObjectId(playListID)) {
            return res.status(500).json({
                ok: false,
                msg: 'Error en la petición.'
            });
        }
        let data = { name, description, type };
        playList_model_1.default.findByIdAndUpdate(playListID, data, { new: true }, (err, song) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }
            if (!song) {
                return res.status(404).json({
                    ok: false,
                    msg: 'La playList no existe.'
                });
            }
            return res.json({
                ok: true,
                msg: 'PalyList actualizada con éxito.',
                song
            });
        });
    }
    addSongPlayList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let songID = req.body.songID;
            let playListID = req.params.playList;
            if (!mongoose_1.isValidObjectId(playListID) || !mongoose_1.isValidObjectId(songID)) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }
            try {
                let validateSong = yield song_model_1.default.findById(songID);
                if (!validateSong) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'La canción que tratar de añadir no existe.'
                    });
                }
                let validatePlayList = yield playList_model_1.default.findById(playListID);
                if (!validateSong) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'La play list no existe.'
                    });
                }
                let songExist = validatePlayList.songs.find((songs) => String(songs.song) === songID);
                if (songExist) {
                    return res.json({
                        ok: false,
                        msg: 'Ey!! La canción ya se encuentra agregada en la playList.'
                    });
                }
                let addSong = yield playList_model_1.default.findByIdAndUpdate(playListID, { $push: { songs: { song: songID } } }, { new: true });
                if (!addSong) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'Error!  La canciín no se pudo añadir a la lista de reproducción.'
                    });
                }
                //@ts-ignore
                crearM3U_1.crearM3U(playListID, req.tk);
                res.json({
                    ok: true,
                    msg: 'Canción añadida con éxito',
                    song: addSong
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
    deleteSongPlayList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { playListID, songID } = req.params;
            if (!mongoose_1.isValidObjectId(playListID) || !mongoose_1.isValidObjectId(songID)) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición2.'
                });
            }
            try {
                const data = {
                    $pull: { songs: { song: songID } },
                };
                const quitSong = yield playList_model_1.default.findByIdAndUpdate(playListID, data);
                if (!quitSong) {
                    return res.status(403).json({
                        ok: false,
                        msg: 'No se pudo quitar la canción de la lista de reproduccion.'
                    });
                }
                //@ts-ignore
                crearM3U_1.crearM3U(playListID, req.tk);
                res.json({
                    ok: true,
                    msg: 'Canción quitada con éxito',
                });
            }
            catch (error) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error! No se pudo quitar la canción de la lista de reproduccion. Intentalo nuevamente.',
                    error
                });
            }
        });
    }
    searchPlayList(req, res) {
        let termino = req.params.term;
        let regex = new RegExp(termino, 'i');
        if (!termino) {
            return;
        }
        playList_model_1.default.find({ $or: [{ name: regex }, { type: regex }, { description: regex }] })
            .populate('songs.song')
            .limit(24)
            .exec((err, playLists) => {
            if (err) {
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
    deletePlayList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let playListId = req.params.playlist;
            //@ts-ignore
            let token = req.tk;
            if (!mongoose_1.isValidObjectId(playListId)) {
                return res.status(400).json({
                    ok: true,
                    msg: 'Play List invalida',
                });
            }
            try {
                let devicesDB = yield device_model_1.default.find({});
                let playListDB = yield playList_model_1.default.findById(playListId);
                if (!playListDB) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'No se encontró la playList'
                    });
                }
                let countPlayListInDevice = yield device_model_1.default.countDocuments({ 'playLists.playlist': playListId });
                const data = {
                    $pull: { playLists: { playlist: playListId } },
                };
                //TODO ELIMINAR TAREAS DEL DISPOSITIVO CON ESTA PLAYLIST   
                const updateDevicePlayList = yield device_model_1.default.updateMany({ 'playLists.playlist': playListId }, data);
                console.log(updateDevicePlayList);
                //TODO consultar tareas con el playList  y eliminarlas
                yield task_model_1.default.deleteMany({ playList: playListId });
                yield playList_model_1.default.findByIdAndDelete(playListId);
                let deleteImg = yield deleteUpload_1.deleteUpload('playListsIMG', playListDB.img, token);
                let deletem3u = yield deleteUpload_1.deleteUpload('playLists', playListDB._id + '.m3u', token);
                if (countPlayListInDevice > 0) {
                    for (let d of devicesDB) {
                        let commandDeviceClass = new commandDevice_class_1.CommandDeviceClass(d.identifier);
                        let status = yield commandDeviceClass.command(`removeplaylist ${playListId}.m3u`);
                    }
                }
                res.json({
                    ok: true,
                    msg: 'PlayList eliminado con éxito,',
                    deleteImg,
                    deletem3u
                });
            }
            catch (error) {
                res.json({
                    ok: false,
                    msg: 'PlayList eliminado con éxito,',
                });
            }
        });
    }
}
exports.PlayListController = PlayListController;
