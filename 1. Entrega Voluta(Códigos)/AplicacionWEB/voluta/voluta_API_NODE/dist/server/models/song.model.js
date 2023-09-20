"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schemaSong = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del disco es requerido'],
        maxlength: [100, 'El nombre no puede exceder los 100 caracteres'],
    },
    duration: {
        type: Number,
        required: [true, 'La duración es requerida'],
    },
    file: {
        type: String,
        maxlength: [100, 'El disco no puede exceder los 100 caracteres'],
        default: null
    },
    removed: {
        type: Boolean,
        default: false,
    },
    description: {
        type: String,
    },
    rp: {
        type: Boolean,
        default: false
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
exports.default = mongoose_1.model('Song', schemaSong);
