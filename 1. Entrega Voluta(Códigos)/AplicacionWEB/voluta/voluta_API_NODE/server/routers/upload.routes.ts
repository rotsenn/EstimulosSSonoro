
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
        this.router.put('/api/v1/upload/:id/:type',[this.auth.validateJWT, this.auth.all], this.uploadController.uploadImage);  
        this.router.post('/api/v1/upload-song/:id',[this.auth.validateJWT, this.auth.validateAdmin], this.uploadController.uploadSong);

        this.router.get('/api/v1/upload/:type/:img', this.uploadController.returnImage);
   }

}

const uploadRouter: UploadRouter = new UploadRouter();
export default uploadRouter.router; 