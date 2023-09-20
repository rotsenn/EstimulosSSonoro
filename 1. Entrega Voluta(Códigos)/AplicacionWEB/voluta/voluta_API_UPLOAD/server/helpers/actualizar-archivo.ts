import userModel from "../models/user.model";
import fs from 'fs';
import songModel from "../models/song.model";
import playListModel from "../models/playList.model";


const borrarArchivo = ( path: string ) => {
    if ( fs.existsSync( path ) ) {
        console.log( path, 'Existe')
        // borrar la imagen anterior
        fs.unlinkSync( path );
    }
    console.log( path, 'No Existe') 
}


export const actualizarImage = async(tipo: string, id: string, nombreArchivo: string ) => {

    // El nombre del archivo es el _id
    let pathViejo = '';
    
    switch( tipo ) {

        case 'users':
            let user = await userModel.findById(id);
            if ( !user ) {
                console.log('No es un playList');
                return false;
            }

            pathViejo = `./dist/uploads/users/${ user.img }`;
            console.log('el viejo',pathViejo)
            borrarArchivo( pathViejo );

            user.img = nombreArchivo;
            await user.save();
            return true;

        break;

        case 'playListsIMG':
            let playList = await playListModel.findById(id);
            if ( !playList ) {
                console.log('No es un playList');
                return false;
            }

            pathViejo = `./dist/uploads/playListsIMG/${ playList.img }`; 
            borrarArchivo( pathViejo );

            playList.img = nombreArchivo;
            await playList.save();
            return true;

        break;

        default: return false;

    }

}  



export const actualizarArchivoSong = async(id: string, nombreArchivo: string, duration: number) => {

        // El nombre del archivo es el _id
        let pathViejo = '';    

        const song = await songModel.findById(id);
        if ( !song ) {
            console.log('La canción no existe');
            return false;
        }

        pathViejo = `./dist/uploads/songs/${ song.file }`; 

        console.log('el viejo',pathViejo)

        borrarArchivo( pathViejo );

        song.file = nombreArchivo;
        song.duration = Number(duration);
        await song.save();
        return true;

     
}



export const uploadRemove = async(tipo: string, archivo: string ) => {

    // El nombre del archivo es el _id
    let pathViejo = '';
    
    switch( tipo ) {

        case 'user':

            pathViejo = `./dist/uploads/users/${ archivo }`;
            borrarArchivo( pathViejo );
            return true;

        break;

        case 'playListsIMG':

            pathViejo = `./dist/uploads/playListsIMG/${ archivo }`; 
            borrarArchivo( pathViejo );
            return true;

        break;

        case 'playList':

            pathViejo = `./dist/uploads/playLists/${ archivo }`; 
            borrarArchivo( pathViejo );
            return true;

        break;

        case 'song':

            pathViejo = `./dist/uploads/songs/${ archivo }`; 
            borrarArchivo( pathViejo );
            return true;

        break;
        

        default: return false;

    }

}


