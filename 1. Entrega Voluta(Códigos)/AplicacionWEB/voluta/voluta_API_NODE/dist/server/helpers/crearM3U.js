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
exports.crearM3U = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config/config");
let crearM3U = (playListID, token) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('PlayList', playListID);
    console.log('TOKENNNN', token);
    let header = {
        //@ts-ignore
        'x-token': token
    };
    try {
        let resp = yield axios_1.default.post(config_1.urlServerUpload + '/v1/create-m3u', { playListID }, { headers: header });
        console.log(resp.data);
        return true;
    }
    catch (error) {
        console.log('No se pudo crear m3u');
        return false;
    }
});
exports.crearM3U = crearM3U;
