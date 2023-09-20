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
const nodemailer_1 = __importDefault(require("nodemailer"));
class Email {
    constructor() {
    }
    email() {
        this.smtpTransport = nodemailer_1.default.createTransport({
            host: 'in-v3.mailjet.com',
            port: 587,
            secure: false,
            auth: {
                user: 'abdd2c80397803dc5c73000dd7f92c7c',
                pass: '0167a3974ec44c7acce4fe86d7e8f282'
            }
        });
    }
    sendEmail(from, to, subject, text, html) {
        return __awaiter(this, void 0, void 0, function* () {
            let optionsMail = {
                from, to, subject, text, html
            };
            return yield this.smtpTransport.sendMail(optionsMail);
        });
    }
}
exports.default = Email;
