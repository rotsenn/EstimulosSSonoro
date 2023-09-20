"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schemaPlayList = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'El nombre de la lista de reproducción es requerido.'],
        maxlength: [100, 'El nombre de la lista de reproducción no puede exceder los 100 caracteres'],
    },
    description: {
        type: String,
        required: [true, 'La descripción es requerida'],
        maxlength: [100, 'La descripción no puede exceder los 100 caracteres'],
    },
    type: {
        type: String,
        required: [true, 'El tipo de la lista de reproducción es requerido.'],
        maxlength: [100, 'El tipo de la lista de reproducción no puede exceder los 100 caracteres'],
    },
    songs: [
        {
            song: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Song'
            }
        }
    ],
    img: {
        type: String,
        default: 'play-list.png'
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    dateTMP: Number,
    created: Date,
    createdAt: {
        type: Date,
        default: Date.now()
    }
});
exports.default = mongoose_1.model('PlayList', schemaPlayList);
