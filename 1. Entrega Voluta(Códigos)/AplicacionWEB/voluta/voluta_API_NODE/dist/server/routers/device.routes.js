"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authJWT_midleware_1 = __importDefault(require("../middlewares/authJWT.midleware"));
const device_controller_1 = require("../controllers/device.controller");
// import { CommandController } from '../controllers/devicesRunCommand.controller'; 
class DeviceRoute {
    constructor() {
        this.router = express_1.Router();
        this.controller = new device_controller_1.DeviceController();
        this.auth = new authJWT_midleware_1.default();
        this.routes();
    }
    routes() {
        this.router.post('/api/v1/device', [this.auth.validateJWT, this.auth.all], this.controller.createDevice);
        this.router.get('/api/v1/device/:id', [this.auth.validateJWT], this.controller.getdevice);
        this.router.get('/api/v1/devices', [this.auth.validateJWT], this.controller.getdevices);
        this.router.put('/api/v1/device/:id', [this.auth.validateJWT, this.auth.validateAdmin], this.controller.updatedevice);
        this.router.get('/api/v1/search-device/:term', [this.auth.validateJWT], this.controller.searchdevice);
        this.router.put('/api/v1/delete-device/:device', [this.auth.validateJWT, this.auth.validateAdmin], this.controller.deletedevice);
        this.router.put('/api/v1/add-playList/:device', [this.auth.validateJWT, this.auth.all], this.controller.addPlayListDevice);
        this.router.put('/api/v1/syncUp-playList-devices/:playlist', [this.auth.validateJWT, this.auth.all], this.controller.syncUpAddPlayListDevices);
        this.router.put('/api/v1/quit-playList/:device/playList/:playList', [this.auth.validateJWT, this.auth.all], this.controller.deletePlayListDevice);
        //Azure
        this.router.get('/api/v1/device-status', [this.auth.validateJWT], this.controller.statusDeviceAzure);
        this.router.get('/api/v1/mpc', [this.auth.validateJWT], this.controller.mpcAzure);
        this.router.get('/api/v1/command', [this.auth.validateJWT], this.controller.commandAzure);
        this.router.put('/api/v1/create-task', [this.auth.validateJWT], this.controller.programTask);
        this.router.get('/api/v1/tasks', [this.auth.validateJWT], this.controller.getProgramTask);
        this.router.get('/api/v1/task/:numerTask', [this.auth.validateJWT], this.controller.getTaskNumber);
        this.router.get('/api/v1/search-task/:term/device/:device', [this.auth.validateJWT], this.controller.searchProgramTask);
        this.router.put('/api/v1/delete-task/:device', [this.auth.validateJWT], this.controller.deleteProgramTask);
        this.router.put('/api/v1/update-task/:task', [this.auth.validateJWT], this.controller.updateprogramTask);
        // this.router.post('/api/v1/mpc', this.controller.command) 
    }
}
const deviceRoute = new DeviceRoute();
exports.default = deviceRoute.router;
