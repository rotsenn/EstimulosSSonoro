import { Router } from 'express';
import { PlayListController } from '../controllers/playList.controller';
import AuthMiddleware from '../middlewares/authJWT.midleware';



class PlayListRoute {

   public router: Router = Router();
   private controller: PlayListController = new PlayListController();
   private auth: AuthMiddleware = new AuthMiddleware();

   constructor() {
     this.routes();
   }

   private routes() {

      this.router.post('/api/v1/playlist', [this.auth.validateJWT, this.auth.all], this.controller.createPlayList);  
      this.router.get('/api/v1/playlist/:id',[this.auth.validateJWT],this.controller.getPlayList);
      this.router.get('/api/v1/playLists',[this.auth.validateJWT],this.controller.getPlayLists); 
      this.router.put('/api/v1/playList/:id',[this.auth.validateJWT, this.auth.validateAdmin],this.controller.updatePlayList);
      this.router.get('/api/v1/search-playLists/:term',[this.auth.validateJWT],this.controller.searchPlayList);
      this.router.put('/api/v1/add-song/:playList', [this.auth.validateJWT, this.auth.all], this.controller.addSongPlayList); 
      this.router.put('/api/v1/delete-song/:songID/playList/:playListID', [this.auth.validateJWT, this.auth.all], this.controller.deleteSongPlayList); 
      this.router.put('/api/v1/delete-playList/:playlist', [this.auth.validateJWT, this.auth.all], this.controller.deletePlayList); 
  
    }

}

const playListRoute: PlayListRoute = new PlayListRoute();
export default playListRoute.router; 
