"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = __importDefault(require("../controllers/upload.controller"));
const authJWT_midleware_1 = __importDefault(require("../middlewares/authJWT.midleware"));
class UploadRouter {
    constructor() {
        this.router = express_1.Router();
        this.auth = new authJWT_midleware_1.default();
        this.uploadController = new upload_controller_1.default();
        this.routes();
    }
    routes() {
        this.router.put('/api/v1/upload/:id/:type', [this.auth.validateJWT], this.uploadController.uploadArchivo);
        this.router.post('/api/v1/upload-song/:id', [this.auth.validateJWT], this.uploadController.uploadSong);
        this.router.post('/api/v1/create-m3u', [this.auth.validateJWT], this.uploadController.createM3U);
        this.router.get('/api/v1/upload/:type/:name', this.uploadController.returnArchivoM3U); // hay que implementar seguridad de token  solo tipo m3u y song(Config de 24 horas)
        this.router.get('/api/v1/get-upload/:type/:name', [this.auth.validateJWT], this.uploadController.returnArchivo);
        this.router.put('/api/v1/upload-remove/:type/:name', [this.auth.validateJWT], this.uploadController.uploadRemove);
    }
}
const uploadRouter = new UploadRouter();
exports.default = uploadRouter.router;
