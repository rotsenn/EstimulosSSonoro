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
const axios_1 = __importDefault(require("axios"));
let verUsers = (value) => __awaiter(void 0, void 0, void 0, function* () {
    let header = {
        'Authorization': 'SharedAccessSignature sr=5de5143b-f79b-4f60-bc19-b72961b3fff9&sig=Z5Bx17bct7lH78QhwV6NxJPez%2Brf73%2FQVW0mDMPrqdc%3D&skn=crpCommand&se=1666533263468'
    };
    try {
        let resp = yield axios_1.default.post(`https://crp.azureiotcentral.com/api/devices/rpi-01/commands/mpc?api-version=1.0`, { request: "mpc " + value }, { headers: header });
        // console.log(resp.data);             
    }
    catch (error) {
        // console.log(error);
        return false;
    }
});
verUsers('play');
