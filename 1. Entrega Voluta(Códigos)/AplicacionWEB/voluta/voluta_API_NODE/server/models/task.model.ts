import mongoose, { Document, model, Schema } from 'mongoose';
const AutoIncrement = require('mongoose-sequence')(mongoose);

export interface ITask extends Document{

    taskNumber: number,
    title: string,
    description: string,
    device: Schema.Types.ObjectId,
    playList: Schema.Types.ObjectId,
    startDate: String ,
    startHour: String,
    endDate: String ,
    endHour: String,
    startDateUnix: number;
    endDateUnix: number;
    shuffle: boolean, 
    repeat: boolean, 
    random: boolean,
    user: Schema.Types.ObjectId,
    dateTMP: number;
    created: Date;

}


const schemaTask = new Schema({

    taskNumber: {
        type: Number,
        unique: true,
    },
    title: {
        type: String,
        required  : [ true, 'El título de la lista de reproducción es requerido.' ], 
        maxlength : [ 100, 'El título de la lista de reproducción no puede exceder los 100 caracteres'],
    },
    description: {
        type: String,
        required  : [ true, 'La descripción es requerida' ], 
        maxlength : [ 100, 'La descripción no puede exceder los 100 caracteres'],
    },
    device: {
        type: Schema.Types.ObjectId,
        required: [ true, 'El dispositivo es requerido' ], 
        ref: 'Device'
    },
    playList: {
        type: Schema.Types.ObjectId,
        ref: 'PlayList'
    },
    startDate: {type: String, required: [true, 'Fecha de inicio es requrida']} ,
    startHour: {type: String, required: [true, 'Hora de inicio es requrida']} ,
    endDate: {type: String, required: [true, 'Fecha final es requrida']} , 
    endHour: {type: String, required: [true, 'Hora final es requrida']} ,
    startDateUnix: Number,
    endDateUnix: Number,
    shuffle: Boolean, 
    repeat: Boolean, 
    random: Boolean,
    user: {
        type: Schema.Types.ObjectId,
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

schemaTask.plugin(AutoIncrement, {id:'task_seq', inc_field: 'taskNumber'});
export default model<ITask>('Task', schemaTask); 