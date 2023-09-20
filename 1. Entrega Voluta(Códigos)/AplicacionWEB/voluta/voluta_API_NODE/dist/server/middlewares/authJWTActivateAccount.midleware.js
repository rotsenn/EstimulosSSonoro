"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
class ActivateAccountMiddleware {
    validateJWTValidateAccount(req, res, next) {
        // Leer el Token
        const token = req.query.token;
        if (!token) {
            return res.status(401).json({
                ok: false,
                msg: 'No hay token-a en la petición'
            });
        }
        try {
            const { uid, hash } = jsonwebtoken_1.default.verify(token, config_1.config.SEEDVALIDATEACCOUNT);
            //@ts-ignore
            req.uid = uid;
            //@ts-ignore
            req.hash = hash;
            next();
        }
        catch (error) {
            return res.status(401).json({
                ok: false,
                msg: 'El link ha caducado'
            });
        }
    }
}
exports.default = ActivateAccountMiddleware;
