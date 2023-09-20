"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const authJWT_midleware_1 = __importDefault(require("../middlewares/authJWT.midleware"));
const authJWTActivateAccount_midleware_1 = __importDefault(require("../middlewares/authJWTActivateAccount.midleware"));
class AuthRouter {
    constructor() {
        this.router = express_1.Router();
        this.controller = new auth_controller_1.default();
        this.auth = new authJWT_midleware_1.default();
        this.authValidateAccount = new authJWTActivateAccount_midleware_1.default();
        this.routes();
    }
    routes() {
        this.router.post('/api/v1/login', this.controller.login);
        this.router.get('/api/v1/renew', [this.auth.validateJWT, this.auth.all], this.controller.renewToken); // Renovar token
        // this.router.post('/api/v1/cambiar-password', [this.auth.validateJWT, this.auth.all], this.controller.cambiarPasswordUser);  
        this.router.get('/api/v1/validate-account', [this.authValidateAccount.validateJWTValidateAccount], this.controller.validateAccount); //Validar cuenta desde email.
        this.router.post('/api/v1/password-reset', this.controller.passwordReset); // Solicitud para recuperar Password (email por body)
        this.router.get('/api/v1/validar-tk-crear-password', [this.authValidateAccount.validateJWTValidateAccount], this.controller.validateTokenNewPassword); // Validar que el token esté correcto para mostrar formulario en front
        this.router.put('/api/v1/new-password', [this.authValidateAccount.validateJWTValidateAccount], this.controller.newPasswordReset); // crear nuevo password
    }
}
const authRouter = new AuthRouter();
exports.default = authRouter.router;
