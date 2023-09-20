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
exports.uploadRemove = exports.actualizarArchivoSong = exports.actualizarImage = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const fs_1 = __importDefault(require("fs"));
const song_model_1 = __importDefault(require("../models/song.model"));
const playList_model_1 = __importDefault(require("../models/playList.model"));
const borrarArchivo = (path) => {
    if (fs_1.default.existsSync(path)) {
        console.log(path, 'Existe');
        // borrar la imagen anterior
        fs_1.default.unlinkSync(path);
    }
    console.log(path, 'No Existe');
};
const actualizarImage = (tipo, id, nombreArchivo) => __awaiter(void 0, void 0, void 0, function* () {
    // El nombre del archivo es el _id
    let pathViejo = '';
    switch (tipo) {
        case 'users':
            let user = yield user_model_1.default.findById(id);
            if (!user) {
                console.log('No es un playList');
                return false;
            }
            pathViejo = `./dist/uploads/users/${user.img}`;
            console.log('el viejo', pathViejo);
            borrarArchivo(pathViejo);
            user.img = nombreArchivo;
            yield user.save();
            return true;
            break;
        case 'playListsIMG':
            let playList = yield playList_model_1.default.findById(id);
            if (!playList) {
                console.log('No es un playList');
                return false;
            }
            pathViejo = `./dist/uploads/playListsIMG/${playList.img}`;
            borrarArchivo(pathViejo);
            playList.img = nombreArchivo;
            yield playList.save();
            return true;
            break;
        default: return false;
    }
});
exports.actualizarImage = actualizarImage;
const actualizarArchivoSong = (id, nombreArchivo, duration) => __awaiter(void 0, void 0, void 0, function* () {
    // El nombre del archivo es el _id
    let pathViejo = '';
    const song = yield song_model_1.default.findById(id);
    if (!song) {
        console.log('La canción no existe');
        return false;
    }
    pathViejo = `./dist/uploads/songs/${song.file}`;
    console.log('el viejo', pathViejo);
    borrarArchivo(pathViejo);
    song.file = nombreArchivo;
    song.duration = Number(duration);
    yield song.save();
    return true;
});
exports.actualizarArchivoSong = actualizarArchivoSong;
const uploadRemove = (tipo, archivo) => __awaiter(void 0, void 0, void 0, function* () {
    // El nombre del archivo es el _id
    let pathViejo = '';
    switch (tipo) {
        case 'user':
            pathViejo = `./dist/uploads/users/${archivo}`;
            borrarArchivo(pathViejo);
            return true;
            break;
        case 'playListsIMG':
            pathViejo = `./dist/uploads/playListsIMG/${archivo}`;
            borrarArchivo(pathViejo);
            return true;
            break;
        case 'playList':
            pathViejo = `./dist/uploads/playLists/${archivo}`;
            borrarArchivo(pathViejo);
            return true;
            break;
        case 'song':
            pathViejo = `./dist/uploads/songs/${archivo}`;
            borrarArchivo(pathViejo);
            return true;
            break;
        default: return false;
    }
});
exports.uploadRemove = uploadRemove;
