import Email from "./email.class";
import TemplatesAutenticationEmail from './templates/UserAutentication.class';
import TemplatePasswordReset from './templates/UserPasswordReset.class';
import { config } from "../config/config";

const { v4: uuidv4 } = require('uuid');

// Envio de emails para autenticación de cuentas

export default class AccountVerification {

    createHash() {
        return `${ uuidv4() }`;
    }

    async accountUserVerification(emailTo: string, tokenValidateAccount: string, userName: string) {
        const email = new Email();
        email.email();
        const html = new TemplatesAutenticationEmail(tokenValidateAccount, userName).templateAccountVerification();
        let enviar = await email.sendEmail(`VOLUTA ${config.email} `,emailTo,'Verifica tu cuenta','text', html);       
        return enviar;                
    }


    async passwordReset(emailTo: string, tokenValidateAccount: string, userName: string) {

        const email = new Email();
        email.email();
        const html = new TemplatePasswordReset(tokenValidateAccount, userName).templatePasswordReset();
        let enviar = await email.sendEmail(`VOLUTA ${config.email}`, emailTo,'Recuperar contraseña','text', html);
        return enviar;  

    }


    

}