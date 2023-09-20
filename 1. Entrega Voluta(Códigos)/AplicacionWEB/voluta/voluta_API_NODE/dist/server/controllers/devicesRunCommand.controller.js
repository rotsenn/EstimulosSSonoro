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
exports.CommandController = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config/config");
class CommandController {
    constructor(device) {
        this.authorization = config_1.tokenAzure;
        this.device = device;
    }
    commandMpc(command) {
        return __awaiter(this, void 0, void 0, function* () {
            let header = {
                'Authorization': this.authorization
            };
            try {
                let resp = yield axios_1.default.post(`${config_1.urlApiAzure}/${this.device}/commands/mpc?api-version=1.0`, { request: 'mpc ' + command }, { headers: header });
                console.log(resp.data);
                let data = {
                    ok: true,
                    msg: ''
                };
                return data;
            }
            catch (error) {
                let data = {
                    ok: false,
                    err: error
                };
                return data;
            }
        });
    }
    deviceStatus(command) {
        return __awaiter(this, void 0, void 0, function* () {
            let header = {
                'Authorization': this.authorization
            };
            try {
                let resp = yield axios_1.default.get(`${config_1.urlApiAzure}/${this.device}/properties?api-version=1.0`, { headers: header });
                console.log(resp.data);
                let data = {
                    ok: true,
                    msg: ''
                };
                return data;
            }
            catch (error) {
                let data = {
                    ok: false,
                    err: error
                };
                return data;
            }
        });
    }
}
exports.CommandController = CommandController;
