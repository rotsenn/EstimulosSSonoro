import userModel from "../models/user.model";
import fs from 'fs';
import songModel from "../models/song.model";
import playListModel from "../models/playList.model";


export const borrarArchivo = ( path: string ) => {
    if ( fs.existsSync( path ) ) {
        console.log( path, 'Existe')
        // borrar la imagen anterior
        fs.unlinkSync( path );
    }
    console.log( path, 'No Existe') 
}


export const actualizarArchivo = async(tipo: string, id: string, nombreArchivo: string ) => {

    // El nombre del archivo es el _id
    let pathViejo = '';
    
    switch( tipo ) {

        case 'users':
            let user = await userModel.findById(id);
            if ( !user ) {
                console.log('No es un playList');
                return false;
            }

            pathViejo = `./dist/uploads/playList/${ user.img }`;
            console.log('el viejo',pathViejo)
            borrarArchivo( pathViejo );

            user.img = nombreArchivo;
            await user.save();
            return true;

        break;

        case 'playLists':
            let playList = await playListModel.findById(id);
            if ( !playList ) {
                console.log('No es un playList');
                return false;
            }

            pathViejo = `./dist/uploads/playList/${ playList.img }`; 
            console.log('el viejo',pathViejo);
            borrarArchivo( pathViejo );

            playList.img = nombreArchivo;
            await playList.save();
            return true;

        break;

        default: return false;

    }

}  



export const actualizarArchivoSong = async(id: string, nombreArchivo: string ) => {

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
        await song.save();
        return true;

     
}


