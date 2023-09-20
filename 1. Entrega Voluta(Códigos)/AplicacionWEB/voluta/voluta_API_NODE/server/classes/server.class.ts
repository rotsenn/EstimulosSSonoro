import express from 'express';
import socketIO from 'socket.io';
import http from 'http';
import { config, origenSocket } from '../config/config';
import { vaciarUserOnlineBlanco } from '../dailyTasks/tasks';
// import { constants } from 'crypto' 
// import fs from 'fs'; 
import * as socket from '../sockets/socket'; 



export default class Server {

    private static _instance: Server;
    public app: express.Application;
    public port: number;
    public io: socketIO.Server;
    private httpServer: http.Server;

    private constructor() {
        this.app = express();
        this.port = Number(config.port);
        this.httpServer = new http.Server(this.app);
        //@ts-ignore
        this.io = socketIO( this.httpServer,{
            cors: {
                origin: origenSocket,
                methods: ["GET", "POST"] 
              }
        } );
        this.escucharSockets();
        this.dailyTasks();
    }

    public static get instance() {
         return this._instance || (this._instance = new this());   
    }
 
    private escucharSockets() {       
        console.log('Se conecto al socket')

        this.io.on('connection', client => {           
            console.log('Cliente Conectado', client.id);

            //conectar Cliente user
            socket.conectarCliente(client, this.io);

            //configurar Usuario
            socket.configUser(client, this.io );

            //Desconectar
            socket.desconectar( client, this.io )

            //obtener usuarios
            socket.obtenerUsuarios(client, this.io);


        });

    }

    // Iniciar tareas diarias
    private dailyTasks() {

        vaciarUserOnlineBlanco();

    }

    public start(callback: any) {
        this.httpServer.listen(this.port, (callback) );
    } 



}