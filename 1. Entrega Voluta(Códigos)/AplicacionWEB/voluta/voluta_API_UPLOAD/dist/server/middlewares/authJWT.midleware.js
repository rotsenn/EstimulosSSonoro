"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
class AuthMiddleware {
    validateJWT(req, res, next) {
        // Leer el Token
        let token = '';
        if (req.header('x-token') && !req.query.tk) {
            token = req.header('x-token');
        }
        if (!req.header('x-token') && req.query.tk) {
            token = req.query.tk;
        }
        if (!token) {
            return res.status(401).json({
                ok: false,
                msg: 'No tk en la petición'
            });
        }
        try {
            const { uid } = jsonwebtoken_1.default.verify(token, config_1.config.SEED);
            //@ts-ignore
            req.uid = uid;
            next();
        }
        catch (error) {
            return res.status(401).json({
                ok: false,
                msg: 'Tk no válido'
            });
        }
    }
    validateJWTUpdateSeedUpdate(req, res, next) {
        // Leer el Token
        const token = req.query.tk;
        if (!token) {
            return res.status(401).json({
                ok: false,
                msg: 'No tk en la petición'
            });
        }
        try {
            const { uid } = jsonwebtoken_1.default.verify(token, config_1.config.SEEDUPLOAD);
            //@ts-ignore
            req.uid = uid;
            next();
        }
        catch (error) {
            return res.status(401).json({
                ok: false,
                msg: 'Tk no válido'
            });
        }
    }
}
exports.default = AuthMiddleware;
