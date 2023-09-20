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
const song_model_1 = __importDefault(require("../models/song.model"));
const mongoose_1 = require("mongoose");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config/config");
const playList_model_1 = __importDefault(require("../models/playList.model"));
const crearM3U_1 = require("../helpers/crearM3U");
const moment_1 = __importDefault(require("moment"));
const hora_1 = require("../config/hora");
const task_model_1 = __importDefault(require("../models/task.model"));
class GenreController {
    createSong(req, res) {
        //@ts-ignore
        let userId = req.uid;
        let { name, description } = req.body;
        let data = { name, duration: 0, description, user: userId };
        console.log(req.body);
        song_model_1.default.create(data, (err, song) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.',
                    err
                });
            }
            if (!song) {
                return res.status(404).json({
                    ok: false,
                    msg: 'La canción no se pudo crear, intentalo nuevamente.'
                });
            }
            return res.json({
                ok: true,
                msg: 'Canción creada con éxito.',
                song
            });
        });
    }
    getSong(req, res) {
        let songId = req.params.id;
        if (!mongoose_1.isValidObjectId(songId)) {
            return res.json({
                ok: false,
                msg: 'Sin nombre.',
                song: songId
            });
        }
        song_model_1.default.findById(songId, (err, song) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.',
                    songId
                });
            }
            if (!song) {
                return res.status(404).json({
                    ok: false,
                    msg: 'La cancion no existe.'
                });
            }
            return res.json({
                ok: true,
                song
            });
        });
    }
    getSongs(req, res) {
        let itemsPerPage = Number(req.query.items) || 30;
        let pagina = Number(req.query.page) || 1;
        pagina = Number(pagina - 1);
        let desde = pagina * itemsPerPage;
        desde = Number(desde);
        song_model_1.default.find()
            .sort({ createdAt: -1 })
            .skip(desde)
            .limit(itemsPerPage)
            .exec((err, songs) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }
            song_model_1.default.countDocuments((err, count) => {
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
                    songs
                });
            });
        });
    }
    updateSong(req, res) {
        let songId = req.params.id;
        let { name, description } = req.body;
        if (!mongoose_1.isValidObjectId(songId) || songId === undefined || songId === '') {
            return res.status(500).json({
                ok: false,
                msg: 'Error en la petición.'
            });
        }
        let data = { name, description };
        song_model_1.default.findByIdAndUpdate(songId, data, { new: true }, (err, song) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }
            if (!song) {
                return res.status(404).json({
                    ok: false,
                    msg: 'La canción no existe.'
                });
            }
            return res.json({
                ok: true,
                msg: 'Canción actualizada con éxito.',
                song
            });
        });
    }
    removeSong(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let songId = req.params.song;
            if (!mongoose_1.isValidObjectId(songId)) {
                return res.status(401).json({
                    ok: false,
                    msg: 'Canción inválida'
                });
            }
            try {
                let playLists = [];
                let validateSongPlayList = yield playList_model_1.default.find({ 'songs.song': songId });
                const today = moment_1.default(new hora_1.HoraConfig().horaMenosCinco).unix(); // actual                                      
                if (validateSongPlayList.length > 0) {
                    for (let s of validateSongPlayList) {
                        playLists.push(s._id);
                    }
                    let validatePlayListTask = yield task_model_1.default.find({ playList: { $in: playLists }, startDateUnix: { $gt: today } });
                    if (validatePlayListTask.length > 0) {
                        return res.status(401).json({
                            ok: true,
                            msg: 'No se puede eliminar la canción por que se encuentra en una lista próxima a sonar en el dispositivo.'
                        });
                    }
                    const quitSongs = yield playList_model_1.default.updateMany({ 'songs.song': songId }, { $pull: { songs: { song: songId } } });
                    if (quitSongs.modifiedCount < 1) {
                        return res.status(403).json({
                            ok: false,
                            msg: 'No se pudo quitar la canción de la lista de reproduccion, por favor intentalo nuevamente.'
                        });
                    }
                    let removeSong = yield song_model_1.default.findOneAndDelete(songId);
                    console.log(removeSong);
                    if (!removeSong) {
                        return res.status(403).json({
                            ok: false,
                            msg: 'No se pudo quitar la canción de la lista de reproduccion.'
                        });
                    }
                    for (let pl of playLists) {
                        //@ts-ignore
                        let createM3U = yield crearM3U_1.crearM3U(pl, req.tk);
                        console.log('Se creó m3u', createM3U);
                    }
                    return res.json({
                        ok: true,
                        msg: 'Canción eliminada con éxito.'
                    });
                }
                let removeSong = yield song_model_1.default.findOneAndDelete(songId);
                if (!removeSong) {
                    return res.status(403).json({
                        ok: false,
                        msg: 'No se pudo quitar la canción de la lista de reproduccion.'
                    });
                }
                return res.json({
                    ok: true,
                    msg: 'canción eliminada con éxito'
                });
            }
            catch (error) {
                console.log(error);
                res.status(500).json({
                    ok: false,
                    error,
                    msg: 'No se pudo eliminar la canción, intentalo nuevamente.'
                });
            }
        });
    }
    addSongPlayLists(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const songId = req.params.id;
            const playListsId = req.body; //llega [{ playList: ''} ]
            if (!mongoose_1.isValidObjectId(songId)) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Data no válida'
                });
            }
            let playLists = [];
            for (let p of playListsId) {
                playLists.push(p.playList);
            }
            if (playListsId.length < 1) {
                return res.status(403).json({
                    ok: false,
                    msg: 'Sin Data'
                });
            }
            for (let pl of playLists) {
                try {
                    let prueba = yield playList_model_1.default.findById(pl);
                    let consulta = prueba === null || prueba === void 0 ? void 0 : prueba.songs.find(resp => String(resp.song) === String(songId));
                    if (!consulta) {
                        yield playList_model_1.default.findByIdAndUpdate(pl, { $addToSet: { songs: { song: songId } } });
                        //@ts-ignore
                        crearM3U_1.crearM3U(pl, req.tk);
                    }
                }
                catch (error) {
                    console.log(error);
                }
            }
            // let songsPlayList = await playListModel.updateMany({ "_id": { "$in": playLists } }, {$addToSet:{songs:{song: songId}}}, {new: true});
            res.json({
                ok: true,
                msg: 'Canciones agregadas con éxito',
            });
        });
    }
    searchSong(req, res) {
        let termino = req.params.term;
        let regex = new RegExp(termino, 'i');
        if (!termino) {
            return res.status(400).json({
                ok: false,
                msg: 'No hay término de busqueda.',
            });
        }
        let request = { $or: [{ name: regex }, { description: regex }] };
        song_model_1.default.find(request)
            .limit(50)
            .exec((err, songs) => {
            if (err) {
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
    command(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { comando, device } = req.body;
            console.log('El body', req.body);
            let header = {
                'Authorization': 'SharedAccessSignature sr=5de5143b-f79b-4f60-bc19-b72961b3fff9&sig=Z5Bx17bct7lH78QhwV6NxJPez%2Brf73%2FQVW0mDMPrqdc%3D&skn=crpCommand&se=1666533263468'
            };
            try {
                let resp = yield axios_1.default.post(`${config_1.config.urlApiAzure}/devices/${device}/commands/mpc?api-version=1.0`, { request: comando }, { headers: header });
                res.json({
                    ok: true,
                    response: resp.data
                });
            }
            catch (error) {
                res.status(500).json({
                    error
                });
            }
        });
    }
    getDevicesAzure(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let header = {
                'Authorization': 'SharedAccessSignature sr=5de5143b-f79b-4f60-bc19-b72961b3fff9&sig=Z5Bx17bct7lH78QhwV6NxJPez%2Brf73%2FQVW0mDMPrqdc%3D&skn=crpCommand&se=1666533263468'
            };
            try {
                let resp = yield axios_1.default.get(`https://crp.azureiotcentral.com/api/devices?api-version=1.0`, { headers: header });
                res.json({
                    ok: true,
                    devices: resp.data.value
                });
            }
            catch (error) {
                res.status(500).json({
                    error
                });
            }
        });
    }
    createDevicesAzure(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = req.body.id;
            let data = req.body;
            delete data.id;
            let header = {
                'Authorization': 'SharedAccessSignature sr=5de5143b-f79b-4f60-bc19-b72961b3fff9&sig=Z5Bx17bct7lH78QhwV6NxJPez%2Brf73%2FQVW0mDMPrqdc%3D&skn=crpCommand&se=1666533263468'
            };
            try {
                let resp = yield axios_1.default.put(`https://crp.azureiotcentral.com/api/devices/${id}?api-version=1.0`, data, { headers: header });
                res.json({
                    ok: true,
                    devices: resp.data.value
                });
            }
            catch (error) {
                res.status(500).json({
                    ok: false,
                    error,
                    msg: 'Error'
                });
            }
        });
    }
}
exports.default = GenreController;
