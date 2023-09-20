"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const config_1 = require("../config/config");
class Server {
    constructor() {
        this.app = express_1.default();
        this.port = Number(config_1.config.port);
        this.httpServer = new http_1.default.Server(this.app);
        //@ts-ignore
    }
    static get instance() {
        return this._instance || (this._instance = new this());
    }
    start(callback) {
        this.httpServer.listen(this.port, (callback));
    }
}
exports.default = Server;
