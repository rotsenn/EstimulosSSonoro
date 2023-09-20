"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = __importDefault(require("socket.io"));
const http_1 = __importDefault(require("http"));
const config_1 = require("../config/config");
const tasks_1 = require("../dailyTasks/tasks");
// import { constants } from 'crypto' 
// import fs from 'fs'; 
const socket = __importStar(require("../sockets/socket"));
class Server {
    constructor() {
        this.app = express_1.default();
        this.port = Number(config_1.config.port);
        this.httpServer = new http_1.default.Server(this.app);
        //@ts-ignore
        this.io = socket_io_1.default(this.httpServer, {
            cors: {
                origin: config_1.origenSocket,
                methods: ["GET", "POST"]
            }
        });
        this.escucharSockets();
        this.dailyTasks();
    }
    static get instance() {
        return this._instance || (this._instance = new this());
    }
    escucharSockets() {
        console.log('Se conecto al socket');
        this.io.on('connection', client => {
            console.log('Cliente Conectado', client.id);
            //conectar Cliente user
            socket.conectarCliente(client, this.io);
            //configurar Usuario
            socket.configUser(client, this.io);
            //Desconectar
            socket.desconectar(client, this.io);
            //obtener usuarios
            socket.obtenerUsuarios(client, this.io);
        });
    }
    // Iniciar tareas diarias
    dailyTasks() {
        tasks_1.vaciarUserOnlineBlanco();
    }
    start(callback) {
        this.httpServer.listen(this.port, (callback));
    }
}
exports.default = Server;
