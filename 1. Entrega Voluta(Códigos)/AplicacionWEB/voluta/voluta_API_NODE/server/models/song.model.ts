import { Document, model, Schema } from 'mongoose';

export interface ISong extends Document{ 

    name: string,
    duration: string, 
    file: string,
    removed:boolean,
    description: number,
    user: Schema.Types.ObjectId,
    dateTMP: number;
    created: Date;

}


const schemaSong = new Schema({

    name: {
        type: String,
        required  : [ true, 'El nombre del disco es requerido' ], 
        maxlength : [ 100, 'El nombre no puede exceder los 100 caracteres'],
    },
    duration: {
        type: Number,
        required  : [ true, 'La duración es requerida' ], 
    },
    file: {
        type: String,
        maxlength : [ 100, 'El disco no puede exceder los 100 caracteres'],
        default: null
    },
    removed: {
        type: Boolean,
        default: false,
    },
    description: {
        type: String,
    },
    rp:{                   //identificar en front cuando está sonando una cancion
        type: Boolean,
        default: false
    },
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

export default model<ISong>('Song', schemaSong); 