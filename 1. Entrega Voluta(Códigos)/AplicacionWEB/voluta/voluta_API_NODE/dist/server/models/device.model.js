"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schemaDevice = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del dispositivo es requerido.'],
        maxlength: [100, 'El nombre no puede exceder los 100 caracteres.'],
        unique: [true, 'El nombre del dispositivo debe ser único.'],
    },
    identifier: {
        type: String,
        required: [true, 'El nombre de identificación del dispositivo es requerido.'],
        maxlength: [100, 'El nombre de identificación no puede exceder los 100 caracteres.'],
        unique: [true, 'El nombre de identificación del dispositivo debe ser único.'],
    },
    description: {
        type: String,
        required: [true, 'La descripción es requerida.'],
        maxlength: [100, 'La descripción no puede exceder los 100 caracteres.'],
    },
    location: {
        type: String,
        required: [true, 'La ubicación del del dispositivo es requerida.'],
        maxlength: [100, 'La descripción de la ubicación no puede exceder los 100 caracteres.'],
    },
    status: {
        type: Boolean,
        default: true,
    },
    removed: {
        type: Boolean,
        default: false,
    },
    playLists: [{
            playlist: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'PlayList'
            }
        }],
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
exports.default = mongoose_1.model('Device', schemaDevice);
