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
exports.stopPlayList = exports.vaciarUserOnlineBlanco = void 0;
const moment_1 = __importDefault(require("moment"));
const user_list_1 = require("../classes/user-list");
let cron = require('node-cron');
const vaciarUserOnlineBlanco = () => {
    cron.schedule('1 4 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        let userList = new user_list_1.UserList().removerDataVacia();
    }));
};
exports.vaciarUserOnlineBlanco = vaciarUserOnlineBlanco;
const stopPlayList = () => {
    cron.schedule('1 12 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        let hoy = moment_1.default().format('YYYY-MM-DD');
        let quinceDias = moment_1.default(hoy).add(15, 'days').format('YYYY-MM-DD');
    }));
};
exports.stopPlayList = stopPlayList;
