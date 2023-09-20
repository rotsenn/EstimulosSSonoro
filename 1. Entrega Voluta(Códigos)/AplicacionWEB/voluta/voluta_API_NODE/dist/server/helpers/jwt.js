"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJWTValidateAccount = exports.generateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
//////////////////////////////////    JWT       ////////////////////////////////////////////////////////
const generateJWT = (uid, hashSession) => {
    return new Promise((resolve, reject) => {
        const payload = {
            uid,
            hashSession
        };
        jsonwebtoken_1.default.sign(payload, config_1.config.SEED, {
            expiresIn: '3h'
        }, (err, token) => {
            if (err) {
                reject('No se pudo generar el JWT');
            }
            else {
                resolve(token);
            }
        });
    });
};
exports.generateJWT = generateJWT;
//////////////////////////////////    JWT VALIDAR EMAIL       ////////////////////////////////////////////////////////
const generateJWTValidateAccount = (uid, hash, time) => {
    const payload = {
        uid,
        hash
    };
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.sign(payload, config_1.config.SEEDVALIDATEACCOUNT, {
            expiresIn: time
        }, (err, token) => {
            if (err) {
                reject('No se pudo generar el token');
            }
            else {
                resolve(token);
            }
        });
    });
};
exports.generateJWTValidateAccount = generateJWTValidateAccount;
