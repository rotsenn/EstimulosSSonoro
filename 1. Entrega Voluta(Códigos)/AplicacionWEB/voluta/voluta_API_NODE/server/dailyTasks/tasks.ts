
import moment from 'moment';
import { UserList } from '../classes/user-list';

let cron = require('node-cron');


export const vaciarUserOnlineBlanco = () => {

    cron.schedule ('1 4 * * *', async () => {
 
        let userList = new UserList().removerDataVacia();


    });    

}



export const stopPlayList = () => {

    cron.schedule ('1 12 * * *', async () => {

        let hoy = moment().format('YYYY-MM-DD');
        let quinceDias: any =  moment(hoy).add(15,'days').format('YYYY-MM-DD');



    });    

}
