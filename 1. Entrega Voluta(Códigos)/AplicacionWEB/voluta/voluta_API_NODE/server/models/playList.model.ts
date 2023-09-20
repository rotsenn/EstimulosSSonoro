import { Document, model, Schema } from 'mongoose';

export interface IPlayList extends Document{

    name: string,
    description: string,
    songs: [{
        song:Schema.Types.ObjectId,
    }],
    img: string,
    type: string,
    removed: boolean,
    user: Schema.Types.ObjectId,
    dateTMP: number;
    created: Date;

}



const schemaPlayList = new Schema({

    name: {
        type: String,
        unique  : [ true, 'El nombre de la lista de reproducción ya se encuentra registrado.' ], 
        required  : [ true, 'El nombre de la lista de reproducción es requerido.' ], 
        maxlength : [ 100, 'El nombre de la lista de reproducción no puede exceder los 100 caracteres'],
        
    },
    description: {
        type: String,
        required  : [ true, 'La descripción es requerida' ], 
        maxlength : [ 100, 'La descripción no puede exceder los 100 caracteres'],
    },
    type: {
        type: String,
        required  : [ true, 'El tipo de la lista de reproducción es requerido.' ], 
        maxlength : [ 100, 'El tipo de la lista de reproducción no puede exceder los 100 caracteres'],
    },
    songs: [
        {
            song:{
                type: Schema.Types.ObjectId,
                ref: 'Song'
            }                
        
        }
    ],
    img: {
        type: String,
        default: 'play-list.png'
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

export default model<IPlayList>('PlayList', schemaPlayList); 