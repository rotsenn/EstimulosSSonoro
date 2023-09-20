import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import AuthMiddleware from '../middlewares/authJWT.midleware';
import ActivateAccountMiddleware from '../middlewares/authJWTActivateAccount.midleware';





class AuthRouter {

   public router: Router = Router();
   private controller: AuthController = new AuthController();
   private auth: AuthMiddleware = new AuthMiddleware();
   private authValidateAccount:ActivateAccountMiddleware  = new ActivateAccountMiddleware();

   constructor() {
     this.routes();
   }

   private routes() {

      this.router.post('/api/v1/login', this.controller.login);
      this.router.get('/api/v1/renew', [this.auth.validateJWT, this.auth.all], this.controller.renewToken);  // Renovar token
      // this.router.post('/api/v1/cambiar-password', [this.auth.validateJWT, this.auth.all], this.controller.cambiarPasswordUser);  

      this.router.get('/api/v1/validate-account', [this.authValidateAccount.validateJWTValidateAccount], this.controller.validateAccount);  //Validar cuenta desde email.
      
      this.router.post('/api/v1/password-reset', this.controller.passwordReset);  // Solicitud para recuperar Password (email por body)
      this.router.get('/api/v1/validar-tk-crear-password', [this.authValidateAccount.validateJWTValidateAccount], this.controller.validateTokenNewPassword);  // Validar que el token esté correcto para mostrar formulario en front
      this.router.put('/api/v1/new-password', [this.authValidateAccount.validateJWTValidateAccount], this.controller.newPasswordReset);  // crear nuevo password
  
   }

}

const authRouter: AuthRouter = new AuthRouter();
export default authRouter.router;
