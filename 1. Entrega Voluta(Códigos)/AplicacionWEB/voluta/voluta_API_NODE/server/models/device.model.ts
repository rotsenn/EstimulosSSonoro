import { Document, model, Schema } from 'mongoose';

export interface IDevice extends Document{

    name: string,
    identifier: string,
    description: string,
    location: string,
    status: string,
    removed: boolean,
    playLists:[{
        playlist: Schema.Types.ObjectId;
    }],
    user: Schema.Types.ObjectId,
    dateTMP: number;
    created: Date;

}


const schemaDevice = new Schema({

    name: {
        type: String,
        required  : [ true, 'El nombre del dispositivo es requerido.' ], 
        maxlength : [ 100, 'El nombre no puede exceder los 100 caracteres.'],
        unique : [ true, 'El nombre del dispositivo debe ser único.'],
    },
    identifier: {
        type: String,
        required  : [ true, 'El nombre de identificación del dispositivo es requerido.' ], 
        maxlength : [ 100, 'El nombre de identificación no puede exceder los 100 caracteres.'],
        unique : [ true, 'El nombre de identificación del dispositivo debe ser único.'],
    },
    description: {
        type: String,
        required  : [ true, 'La descripción es requerida.' ], 
        maxlength : [ 100, 'La descripción no puede exceder los 100 caracteres.'],
    },
    location: {
        type: String,
        required  : [ true, 'La ubicación del del dispositivo es requerida.' ], 
        maxlength : [ 100, 'La descripción de la ubicación no puede exceder los 100 caracteres.'],
    },
    status: {
        type: Boolean,
        default: true,
    },
    removed: {
        type: Boolean,
        default: false,
    },
    playLists:[{
          playlist:{
              type: Schema.Types.ObjectId,
              ref: 'PlayList'
          }
    }],
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

export default model<IDevice>('Device', schemaDevice); 