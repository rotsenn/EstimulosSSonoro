"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const playList_controller_1 = require("../controllers/playList.controller");
const authJWT_midleware_1 = __importDefault(require("../middlewares/authJWT.midleware"));
class PlayListRoute {
    constructor() {
        this.router = express_1.Router();
        this.controller = new playList_controller_1.PlayListController();
        this.auth = new authJWT_midleware_1.default();
        this.routes();
    }
    routes() {
        this.router.post('/api/v1/playlist', [this.auth.validateJWT, this.auth.all], this.controller.createPlayList);
        this.router.get('/api/v1/playlist/:id', [this.auth.validateJWT], this.controller.getPlayList);
        this.router.get('/api/v1/playLists', [this.auth.validateJWT], this.controller.getPlayLists);
        this.router.put('/api/v1/playList/:id', [this.auth.validateJWT, this.auth.validateAdmin], this.controller.updatePlayList);
        this.router.get('/api/v1/search-playLists/:term', [this.auth.validateJWT], this.controller.searchPlayList);
        this.router.put('/api/v1/add-song/:playList', [this.auth.validateJWT, this.auth.all], this.controller.addSongPlayList);
        this.router.put('/api/v1/delete-song/:songID/playList/:playListID', [this.auth.validateJWT, this.auth.all], this.controller.deleteSongPlayList);
        this.router.put('/api/v1/delete-playList/:playlist', [this.auth.validateJWT, this.auth.all], this.controller.deletePlayList);
    }
}
const playListRoute = new PlayListRoute();
exports.default = playListRoute.router;
