"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const song_controller_1 = __importDefault(require("../controllers/song.controller"));
const authJWT_midleware_1 = __importDefault(require("../middlewares/authJWT.midleware"));
class SongRouter {
    constructor() {
        this.router = express_1.Router();
        this.songController = new song_controller_1.default();
        this.auth = new authJWT_midleware_1.default();
        this.routes();
    }
    routes() {
        this.router.post('/api/v1/song', [this.auth.validateJWT, this.auth.validateAdmin], this.songController.createSong);
        this.router.get('/api/v1/song/:id', [this.auth.validateJWT], this.songController.getSong);
        this.router.get('/api/v1/songs', [this.auth.validateJWT], this.songController.getSongs);
        this.router.put('/api/v1/song/:id', [this.auth.validateJWT, this.auth.validateAdmin], this.songController.updateSong);
        this.router.get('/api/v1/search-songs/:term', [this.auth.validateJWT], this.songController.searchSong);
        //añadir canciones a una o varias playLists
        this.router.put('/api/v1/add-song-playlists/:id', [this.auth.validateJWT, this.auth.validateAdmin], this.songController.addSongPlayLists);
        //Pendiente por lógica en controller
        this.router.put('/api/v1/remove-song/:song', [this.auth.validateJWT, this.auth.validateAdmin], this.songController.removeSong);
        // this.router.post('/api/v1/comando', this.songController.command)
        this.router.get('/api/v1/device-azure', this.songController.getDevicesAzure);
        this.router.put('/api/v1/create-device', this.songController.createDevicesAzure);
    }
}
const songRouter = new SongRouter();
exports.default = songRouter.router;
