import { Router } from 'express';
import UserController from '../controllers/userController';
import AuthMiddleware from '../middlewares/authJWT.midleware';


class UserRouter {

   public router: Router = Router();
   private userController = new UserController();
   private auth: AuthMiddleware = new AuthMiddleware();


   constructor() {
     this.routes();
   }

   private routes() {
     
      this.router.post('/api/v1/account-ini', this.userController.createUserIni); // Crear cuenta Inicial
      this.router.post('/api/v1/user',[this.auth.validateJWT, this.auth.validateAdmin], this.userController.createUser);
      this.router.get('/api/v1/user/:id',[this.auth.validateJWT, this.auth.validateAdmin], this.userController.getUser);
      this.router.get('/api/v1/users',[this.auth.validateJWT, this.auth.validateAdmin], this.userController.getUsers);
      this.router.get('/api/v1/search-users/:term',[this.auth.validateJWT, this.auth.validateAdmin],this.userController.searchUser);
      this.router.put('/api/v1/user/:id',[this.auth.validateJWT, this.auth.all], this.userController.userUpdate);

      this.router.put('/api/v1/update-user-name/:user',[this.auth.validateJWT], this.userController.updateUserName);
      
      this.router.put('/api/v1/disable-enable-user', [this.auth.validateJWT, this.auth.validateAdmin], this.userController.disableAndEnableUser);

      this.router.post('/api/v1/changePassword',[this.auth.validateJWT], this.userController.changePassword);
      this.router.get('/api/v1/usersOnline', [this.auth.validateJWT, this.auth.validateAdmin], this.userController.usersOnLine);

   }

}

const userRouter: UserRouter = new UserRouter();
export default userRouter.router;
