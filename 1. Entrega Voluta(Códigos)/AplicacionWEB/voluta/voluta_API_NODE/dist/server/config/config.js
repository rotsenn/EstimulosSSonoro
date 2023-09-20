"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlEmails = exports.urlDominio = exports.config = exports.urlServerUpload = exports.origenSocket = exports.enProduccion = exports.urlApiAzure = exports.tokenAzure = void 0;
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
let urlDB;
let dominioAPI;
let dominio;
let produccion;
let originSocket;
let serverUpload;
// export let tokenAzure = 'SharedAccessSignature sr=5de5143b-f79b-4f60-bc19-b72961b3fff9&sig=Z5Bx17bct7lH78QhwV6NxJPez%2Brf73%2FQVW0mDMPrqdc%3D&skn=crpCommand&se=1666533263468';
// export let urlApiAzure = 'https://crp.azureiotcentral.com/api/devices';
exports.tokenAzure = 'SharedAccessSignature sr=50295a86-cf5b-4efd-9a74-52adc8293e4b&sig=L52UYUcei1dbTLaPMVJp21v7e3heMMaZ89uaGUo%2Bdm4%3D&skn=api-IoT-Linea&se=1670686710460';
exports.urlApiAzure = 'https://linea.azureiotcentral.com/api/devices';
if (process.env.NODE_ENV === 'dev') {
    console.log('local');
    urlDB = 'mongodb+srv://user_amsterdamstudios:laYZw2JUQMTQGUJd@cluster0.vobbc.mongodb.net/crpmusic';
    dominio = 'http://localhost:4200/#/';
    dominioAPI = 'https://localhost:3000/api/';
    produccion = false;
    originSocket = "http://localhost:4200";
    serverUpload = "https://www.iotlineacom.com/api";
}
else {
    console.log('produccion');
    dominio = 'https://voluta-app.herokuapp.com/#/';
    dominioAPI = 'https://voluta-app.herokuapp.com/api/';
    urlDB = 'mongodb+srv://volutaUs:x37JVqKGbd3TumC@cluster0.prqk7.mongodb.net/voluta';
    produccion = true;
    originSocket = "https://voluta-app.herokuapp.com";
    serverUpload = "https://www.iotlineacom.com/api";
}
;
exports.enProduccion = produccion;
exports.origenSocket = originSocket;
exports.urlServerUpload = serverUpload;
console.log('El origen', exports.origenSocket);
exports.config = {
    'port': process.env.PORT || 3000,
    'urlDB': urlDB,
    'SEED': 'SeedDeDesarrolloCambiarloS0p0rt3S0p0rt3<>/&%$$#??',
    'SEEDVALIDATEACCOUNT': 'SeedDeDesarrolloCambiarloS0p0rt3S0p0rt3Valid4t3ac0unt<>/&%$$#??..?%$',
    'caducidad_token': '4h',
    'email': '<info@lineacom.co>',
    'urlApiAzure': 'https://linea.azureiotcentral.com/api/devices/api'
};
exports.urlDominio = {
    url: dominioAPI
};
exports.urlEmails = {
    accountValidateEmail: `${dominio}validar-email/`,
    passwordReset: `${dominio}account/password/reset/`,
    accountPartnerConfirm: `${dominio}business/partner-confirm/`,
    accountRecuperarPassword: `${dominio}recuperar-password/`
};
