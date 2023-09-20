"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = __importDefault(require("../controllers/userController"));
const authJWT_midleware_1 = __importDefault(require("../middlewares/authJWT.midleware"));
class UserRouter {
    constructor() {
        this.router = express_1.Router();
        this.userController = new userController_1.default();
        this.auth = new authJWT_midleware_1.default();
        this.routes();
    }
    routes() {
        this.router.post('/api/v1/account-ini', this.userController.createUserIni); // Crear cuenta Inicial
        this.router.post('/api/v1/user', [this.auth.validateJWT, this.auth.validateAdmin], this.userController.createUser);
        this.router.get('/api/v1/user/:id', [this.auth.validateJWT, this.auth.validateAdmin], this.userController.getUser);
        this.router.get('/api/v1/users', [this.auth.validateJWT, this.auth.validateAdmin], this.userController.getUsers);
        this.router.get('/api/v1/search-users/:term', [this.auth.validateJWT, this.auth.validateAdmin], this.userController.searchUser);
        this.router.put('/api/v1/user/:id', [this.auth.validateJWT, this.auth.all], this.userController.userUpdate);
        this.router.put('/api/v1/update-user-name/:user', [this.auth.validateJWT], this.userController.updateUserName);
        this.router.put('/api/v1/disable-enable-user', [this.auth.validateJWT, this.auth.validateAdmin], this.userController.disableAndEnableUser);
        this.router.post('/api/v1/changePassword', [this.auth.validateJWT], this.userController.changePassword);
        this.router.get('/api/v1/usersOnline', [this.auth.validateJWT, this.auth.validateAdmin], this.userController.usersOnLine);
    }
}
const userRouter = new UserRouter();
exports.default = userRouter.router;
