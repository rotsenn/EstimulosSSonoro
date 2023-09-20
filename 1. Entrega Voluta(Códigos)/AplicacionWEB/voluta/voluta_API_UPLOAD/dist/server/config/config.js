"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.uploadServer = exports.enProduccion = void 0;
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
let urlDB;
let produccion;
let serverUpload;
console.log('Producción');
// urlDB = 'mongodb+srv://user_amsterdamstudios:laYZw2JUQMTQGUJd@cluster0.vobbc.mongodb.net/crpmusic';
urlDB = 'mongodb+srv://volutaUs:x37JVqKGbd3TumC@cluster0.prqk7.mongodb.net/voluta';
produccion = true;
serverUpload = 'https://www.iotlineacom.com';
exports.enProduccion = produccion;
exports.uploadServer = serverUpload;
exports.config = {
    'port': process.env.PORT || 3000,
    'urlDB': urlDB,
    'SEED': 'SeedDeDesarrolloCambiarloS0p0rt3S0p0rt3<>/&%$$#??',
    'SEEDUPLOAD': 'SeedDeDesarrolloUPLOAD.CambiarloS0p0rt3S0p0rt3<>/&%$$#??'
};
