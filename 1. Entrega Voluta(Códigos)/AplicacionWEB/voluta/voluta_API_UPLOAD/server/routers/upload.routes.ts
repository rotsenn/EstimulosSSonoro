
import { Router } from 'express';
import UploadController from '../controllers/upload.controller';
import AuthMiddleware from '../middlewares/authJWT.midleware';


class UploadRouter {

   public router: Router = Router();
   private auth: AuthMiddleware = new AuthMiddleware();
   private uploadController = new UploadController();


   constructor() {
     this.routes();
   }

   private routes() {
        this.router.put('/api/v1/upload/:id/:type',[this.auth.validateJWT], this.uploadController.uploadArchivo);  
        this.router.post('/api/v1/upload-song/:id',[this.auth.validateJWT ], this.uploadController.uploadSong);
        this.router.post('/api/v1/create-m3u',[this.auth.validateJWT ], this.uploadController.createM3U);
        this.router.get('/api/v1/upload/:type/:name', this.uploadController.returnArchivoM3U); // hay que implementar seguridad de token  solo tipo m3u y song(Config de 24 horas)

        this.router.get('/api/v1/get-upload/:type/:name', [this.auth.validateJWT], this.uploadController.returnArchivo);
        this.router.put('/api/v1/upload-remove/:type/:name', [this.auth.validateJWT], this.uploadController.uploadRemove);
   }

}

const uploadRouter: UploadRouter = new UploadRouter();
export default uploadRouter.router; 