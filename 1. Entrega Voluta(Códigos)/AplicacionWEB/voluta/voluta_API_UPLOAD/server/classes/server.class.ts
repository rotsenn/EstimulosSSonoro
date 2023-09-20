import express from 'express';
import http from 'http';
import { config } from '../config/config';

 



export default class Server {

    private static _instance: Server;
    public app: express.Application;
    public port: number;
    private httpServer: http.Server;

    private constructor() {
        this.app = express();
        this.port = Number(config.port);
        this.httpServer = new http.Server(this.app);
        //@ts-ignore
    }

    public static get instance() {
         return this._instance || (this._instance = new this());   
    }
 
    public start(callback: any) {
        this.httpServer.listen(this.port, (callback) );
    } 



}