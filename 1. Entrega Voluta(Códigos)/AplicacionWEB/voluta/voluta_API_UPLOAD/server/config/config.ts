process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

let urlDB;
let produccion: boolean;
let serverUpload: string;



console.log('Producción')
// urlDB = 'mongodb+srv://user_amsterdamstudios:laYZw2JUQMTQGUJd@cluster0.vobbc.mongodb.net/crpmusic';
urlDB = 'mongodb+srv://volutaUs:x37JVqKGbd3TumC@cluster0.prqk7.mongodb.net/voluta';
produccion = true;

serverUpload = 'https://www.iotlineacom.com';


export const enProduccion = produccion; 
export const uploadServer = serverUpload;

export const config = {    
    'port':process.env.PORT || 3000,    // Puerto   
    'urlDB':urlDB, 
    'SEED': 'SeedDeDesarrolloCambiarloS0p0rt3S0p0rt3<>/&%$$#??', 
    'SEEDUPLOAD': 'SeedDeDesarrolloUPLOAD.CambiarloS0p0rt3S0p0rt3<>/&%$$#??'   
};


