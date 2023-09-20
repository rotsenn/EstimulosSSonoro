import mongoose, {Schema, model} from 'mongoose';
// import uniqueValidator from 'mongoose-unique-validator';

let rolesValidos = {
    values: ['SUPER_ROLE', 'ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol valido'
};

export interface IUser extends mongoose.Document {

    userName: string;
    email: string;
    password: string;
    img: string;
    role: string;
    active: boolean;
    google: boolean;
    accountActivated: boolean;
    hash: string;
    hashSession: string;
    lastSessionDate: Date;
    currentSession: Date;
    user: Schema.Types.ObjectId;
    createdAtTMP: string;

};


const userSchema = new Schema({

    userName: {
        type      : String, 
        required  : [ true, 'El nombre de usuario es requerido' ], 
        maxlength : [ 50, 'El nombre no puede exceder los 50 caracteres'],
        minlength : [ 3, 'El nombre debe contener 3 o más caracteres'],
    },
    email: {
        type      : String, 
        unique    : [ true, 'El correo está duplicado'], 
        required  : [ true, 'El correo es necesario' ], 
        maxlength : [ 100, 'El correo no puede exceder los 100 caracteres'] ,
        match     : [/.+\@.+\..+/, 'Por favor ingrese un correo válido'] // <- Validación regexp para correo
    },
    password: {
        type: String,
        required: [true, 'El Password es requerido']
    },    
    img: {
        type: String,
        default: 'avatar.png'
    },
    role: {
        type: String,
        default: "USER_ROLE",
        enum: rolesValidos
    },
    hash:{
        type : String, 
    },
    hashSession: String,    
    lastSessionDate: Date,
    currentSession: Date, // Ultima sesion
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    active: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    },
    accountActivated: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    createdAtTMP: {
        type: String,
    },    

})

userSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject(); //Obtenemos toda la informacion del objeto    usuarioSchema
    delete userObject.password; //Eliminamos el password para que no lo imprima por pantalla
    return userObject;
}

// userSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

export default model<IUser>('User', userSchema); 