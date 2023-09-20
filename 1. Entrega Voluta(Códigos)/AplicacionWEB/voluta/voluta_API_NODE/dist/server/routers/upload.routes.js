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
        this.router.put('/api/v1/upload/:id/:type', [this.auth.validateJWT, this.auth.all], this.uploadController.uploadImage);
        this.router.post('/api/v1/upload-song/:id', [this.auth.validateJWT, this.auth.validateAdmin], this.uploadController.uploadSong);
        this.router.get('/api/v1/upload/:type/:img', this.uploadController.returnImage);
    }
}
const uploadRouter = new UploadRouter();
exports.default = uploadRouter.router;
