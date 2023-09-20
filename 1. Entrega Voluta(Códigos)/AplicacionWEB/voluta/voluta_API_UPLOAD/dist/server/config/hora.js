"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoraConfig = void 0;
const moment_1 = __importDefault(require("moment"));
moment_1.default.locale('es');
class HoraConfig {
    constructor() {
        // this.horaColombiaIsoDate_5 = moment().tz("America/Bogota").format(); 
        this.horaColombiaIsoDate_5 = moment_1.default().subtract(5, 'hours').format();
        this.horaMenosCinco = moment_1.default().subtract(5, 'hours').format();
    }
}
exports.HoraConfig = HoraConfig;
