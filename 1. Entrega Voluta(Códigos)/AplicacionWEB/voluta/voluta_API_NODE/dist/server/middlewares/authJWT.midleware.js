"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const user_model_1 = __importDefault(require("../models/user.model"));
class AuthMiddleware {
    validateJWT(req, res, next) {
        // Leer el Token
        const token = req.header('x-token');
        if (!token) {
            return res.status(401).json({
                ok: false,
                msg: 'No hay token en la petición'
            });
        }
        try {
            const { uid, hashSession } = jsonwebtoken_1.default.verify(token, config_1.config.SEED);
            //@ts-ignore
            req.uid = uid;
            //@ts-ignore
            req.hashSession = hashSession;
            //@ts-ignore
            req.tk = token;
            next();
        }
        catch (error) {
            return res.status(401).json({
                ok: false,
                msg: 'Token no válido'
            });
        }
    }
    all(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            //@ts-ignore
            const uid = req.uid;
            //@ts-ignore
            const hashSession = req.hashSession;
            try {
                const userDB = yield user_model_1.default.findById(uid);
                if (!userDB) {
                    return res.status(404).json({
                        ok: false,
                        msg: 'Usuario no existe'
                    });
                }
                if (!hashSession || String(hashSession) !== String(userDB.hashSession)) {
                    userDB.hashSession = 'XXX';
                    yield userDB.save();
                    return res.status(404).json({
                        ok: false,
                        session: true,
                        msg: 'Usted ya cuenta con una sesión activa, todas se cerrarán.'
                    });
                }
                if (!userDB.active) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'Usuario inactivo'
                    });
                }
                //@ts-ignore
                req.userDB = userDB;
                next();
            }
            catch (error) {
                res.status(500).json({
                    ok: false,
                    msg: 'Hable con el administrador',
                    error
                });
            }
        });
    }
    validateAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            //@ts-ignore
            const uid = req.uid;
            //@ts-ignore
            const hashSession = req.hashSession;
            try {
                const userDB = yield user_model_1.default.findById(uid);
                if (!userDB) {
                    return res.status(404).json({
                        ok: false,
                        msg: 'Usuario no existe'
                    });
                }
                if (!hashSession || String(hashSession) !== String(userDB.hashSession)) {
                    userDB.hashSession = 'XXX';
                    yield userDB.save();
                    return res.status(404).json({
                        ok: false,
                        session: true,
                        msg: 'Usted ya cuenta con una sesión activa, todas se cerraran.'
                    });
                }
                if (!userDB.active) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'Usuario inactivo'
                    });
                }
                if (userDB.role === 'ADMIN_ROLE' || userDB.role === 'SUPER_ROLE') { }
                else {
                    return res.status(400).json({
                        ok: false,
                        msg: `${userDB.userName}, usted no cuenta con permisos suficientes. `
                    });
                }
                //@ts-ignore
                req.userDB = userDB;
                next();
            }
            catch (error) {
                res.status(500).json({
                    ok: false,
                    msg: 'Hable con el administrador',
                    error
                });
            }
        });
    }
}
exports.default = AuthMiddleware;
