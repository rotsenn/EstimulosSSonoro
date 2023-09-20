import helmet from 'helmet'
import Server from './classes/server.class';
import BodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import Routes from './routers';
import Mongoose from 'mongoose';
import fileUpload from 'express-fileupload'; 
import { config } from './config/config'; 
// import DataBaseclass from './classes/dataBase.class'; 
import { permisos } from './config/ListWhite';
// import nocache from 'nocache'; 
import { Request, Response, NextFunction } from 'express';



// Inicializar server
const server = Server.instance;

// server.app.use(helmet());
//seguridad
// server.app.use(helmet.contentSecurityPolicy());
// server.app.use(nocache());
server.app.use(helmet.dnsPrefetchControl());
server.app.use(helmet.expectCt());
server.app.use(helmet.frameguard());
server.app.use(helmet.hidePoweredBy());
server.app.use(helmet.hsts());
server.app.use(helmet.ieNoOpen());
server.app.use(helmet.noSniff());
server.app.use(helmet.permittedCrossDomainPolicies());
server.app.use(helmet.referrerPolicy());
server.app.use(helmet.xssFilter());

// server.app.set('trust proxy', true);
// Body Parser
server.app.use( BodyParser.urlencoded({limit: '1mb', extended: true}) );
server.app.use( BodyParser.json({limit: '1mb'}));

 
//carpeta pública
server.app.use( express.static(__dirname + '/public'));

// Cors  
server.app.use(cors({origin: true, credentials: true})); 
// server.app.use(cors({origin: true, credentials: true})); 

//  server.app.use(fileUpload({ useTempFiles: true }) );


server.app.use('*',function(req: Request,res: Response, next: NextFunction) { 
    

       let origin = req.headers.origin || req.headers.referer  || req.headers.host;

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


server.app.use(fileUpload());
  // Rutas del proyecto
server.app.use('/', Routes);

 //Conexión a DB
 const connectDB = async () => {
   console.log('Conectando a db...')
  await Mongoose.connect(config.urlDB, { })
  .then(()=> { console.log('Se conectó a la BD ') })
      .catch(function (error) {
          console.log('Error conexion mongo', error);
      });
//...rest of code
}; 
connectDB();




// Iniciar server
server.start(()=> {
    console.log(`Server iniciado en el puerto ${ server.port } `);
});