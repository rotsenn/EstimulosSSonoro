import Nodemailer from 'nodemailer';


export default class Email {

    private smtpTransport: Nodemailer.SentMessageInfo;

    constructor() {

    }

    email(){
        this.smtpTransport = Nodemailer.createTransport({
            host: 'in-v3.mailjet.com',
            port: 587,
            secure: false,
            auth: {
                user: 'abdd2c80397803dc5c73000dd7f92c7c',
                pass: '0167a3974ec44c7acce4fe86d7e8f282'
            }
        });
    }

    public async sendEmail(from: string, to: string, subject: string, text: string, html: string) {


       let optionsMail = {
          from, to, subject, text, html
       }       
       return await this.smtpTransport.sendMail(optionsMail);     

    }


}






 


 