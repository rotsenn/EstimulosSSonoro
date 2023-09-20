"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NBDB = void 0;
const helmet_1 = __importDefault(require("helmet"));
const server_class_1 = __importDefault(require("./classes/server.class"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const routers_1 = __importDefault(require("./routers"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const config_1 = require("./config/config");
// Inicializar server
const server = server_class_1.default.instance;
// server.app.use(helmet());
//seguridad
// server.app.use(helmet.contentSecurityPolicy());
// server.app.use(nocache());
server.app.use(helmet_1.default.dnsPrefetchControl());
server.app.use(helmet_1.default.expectCt());
server.app.use(helmet_1.default.frameguard());
server.app.use(helmet_1.default.hidePoweredBy());
server.app.use(helmet_1.default.hsts());
server.app.use(helmet_1.default.ieNoOpen());
server.app.use(helmet_1.default.noSniff());
server.app.use(helmet_1.default.permittedCrossDomainPolicies());
server.app.use(helmet_1.default.referrerPolicy());
server.app.use(helmet_1.default.xssFilter());
// server.app.set('trust proxy', true);
// Body Parser
server.app.use(body_parser_1.default.urlencoded({ limit: '1mb', extended: true }));
server.app.use(body_parser_1.default.json({ limit: '1mb' }));
//carpeta pública
server.app.use(express_1.default.static(__dirname + '/public'));
// Cors  
server.app.use(cors_1.default());
//  server.app.use(fileUpload({ useTempFiles: true }) );
server.app.use('*', function (req, res, next) {
    let origin = req.headers.origin || req.headers.referer || req.headers.host;
    //    if(origin){
    //         const origen = permisos.includes( origin ); 
    //         console.log('El origen', origen);
    //         if(!origen) {
    //             return res.status(400).json({
    //                 ok:false,
    //                 message: "No autorizado"              
    //             });
    //         }
    next();
    //    } else {
    //         return res.status(400).json({
    //             ok:false,
    //             message: "No autorizado"              
    //         });
    //    }
});
server.app.use(express_fileupload_1.default());
// Rutas del proyecto
server.app.use('/', routers_1.default);
//Conexión a DB
exports.NBDB = mongoose_1.default.connect(config_1.config.urlDB, {})
    .then(() => { console.log('Se conectó a la BD '); })
    .catch((err) => { console.log(err); });
// Iniciar server
server.start(() => {
    console.log(`Server iniciado en el puerto ${server.port} `);
});
