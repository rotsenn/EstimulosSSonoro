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
const email_class_1 = __importDefault(require("./email.class"));
const UserAutentication_class_1 = __importDefault(require("./templates/UserAutentication.class"));
const UserPasswordReset_class_1 = __importDefault(require("./templates/UserPasswordReset.class"));
const config_1 = require("../config/config");
const { v4: uuidv4 } = require('uuid');
// Envio de emails para autenticación de cuentas
class AccountVerification {
    createHash() {
        return `${uuidv4()}`;
    }
    accountUserVerification(emailTo, tokenValidateAccount, userName) {
        return __awaiter(this, void 0, void 0, function* () {
            const email = new email_class_1.default();
            email.email();
            const html = new UserAutentication_class_1.default(tokenValidateAccount, userName).templateAccountVerification();
            let enviar = yield email.sendEmail(`VOLUTA ${config_1.config.email} `, emailTo, 'Verifica tu cuenta', 'text', html);
            return enviar;
        });
    }
    passwordReset(emailTo, tokenValidateAccount, userName) {
        return __awaiter(this, void 0, void 0, function* () {
            const email = new email_class_1.default();
            email.email();
            const html = new UserPasswordReset_class_1.default(tokenValidateAccount, userName).templatePasswordReset();
            let enviar = yield email.sendEmail(`VOLUTA ${config_1.config.email}`, emailTo, 'Recuperar contraseña', 'text', html);
            return enviar;
        });
    }
}
exports.default = AccountVerification;
