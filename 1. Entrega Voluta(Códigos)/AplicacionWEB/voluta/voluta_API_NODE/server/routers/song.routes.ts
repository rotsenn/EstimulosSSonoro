import { Router } from 'express';
import SongController from '../controllers/song.controller';
import AuthMiddleware from '../middlewares/authJWT.midleware';

class SongRouter {

   public router: Router = Router();
   private songController = new SongController();
   private auth: AuthMiddleware = new AuthMiddleware();


   constructor() {
      this.routes();
   }

   private routes() {

      this.router.post('/api/v1/song',[this.auth.validateJWT, this.auth.validateAdmin],this.songController.createSong);
      this.router.get('/api/v1/song/:id',[this.auth.validateJWT],this.songController.getSong);
      this.router.get('/api/v1/songs',[this.auth.validateJWT],this.songController.getSongs);   

      this.router.put('/api/v1/song/:id',[this.auth.validateJWT, this.auth.validateAdmin],this.songController.updateSong);
      this.router.get('/api/v1/search-songs/:term',[this.auth.validateJWT],this.songController.searchSong);

      //añadir canciones a una o varias playLists
      this.router.put('/api/v1/add-song-playlists/:id',[this.auth.validateJWT, this.auth.validateAdmin],this.songController.addSongPlayLists);
      
      //Pendiente por lógica en controller
      this.router.put('/api/v1/remove-song/:song',[this.auth.validateJWT, this.auth.validateAdmin],this.songController.removeSong);


      // this.router.post('/api/v1/comando', this.songController.command)
      this.router.get('/api/v1/device-azure', this.songController.getDevicesAzure)
      this.router.put('/api/v1/create-device', this.songController.createDevicesAzure)

  
   }

}

const songRouter: SongRouter = new SongRouter();
export default songRouter.router;