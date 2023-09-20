"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const AutoIncrement = require('mongoose-sequence')(mongoose_1.default);
const schemaTask = new mongoose_1.Schema({
    taskNumber: {
        type: Number,
        unique: true,
    },
    title: {
        type: String,
        required: [true, 'El título de la lista de reproducción es requerido.'],
        maxlength: [100, 'El título de la lista de reproducción no puede exceder los 100 caracteres'],
    },
    description: {
        type: String,
        required: [true, 'La descripción es requerida'],
        maxlength: [100, 'La descripción no puede exceder los 100 caracteres'],
    },
    device: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'El dispositivo es requerido'],
        ref: 'Device'
    },
    playList: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'PlayList'
    },
    startDate: { type: String, required: [true, 'Fecha de inicio es requrida'] },
    startHour: { type: String, required: [true, 'Hora de inicio es requrida'] },
    endDate: { type: String, required: [true, 'Fecha final es requrida'] },
    endHour: { type: String, required: [true, 'Hora final es requrida'] },
    startDateUnix: Number,
    endDateUnix: Number,
    shuffle: Boolean,
    repeat: Boolean,
    random: Boolean,
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
schemaTask.plugin(AutoIncrement, { id: 'task_seq', inc_field: 'taskNumber' });
exports.default = mongoose_1.model('Task', schemaTask);
