import { UserWS } from './user';


export class UserList {

    private list: UserWS[] = [];

    constructor(){

    }

    // agregar usuario
    public addUser(user: UserWS){
       this.list.push(user);
       console.log('Entra', this.list);
       return user;
    }
    
    public updateData(idWs: string, idUser: string, name: string, role: string, img: string){

        // console.log('LLega para edición', idWs, idUser, name, role, img)

        let consulUser = this.list.find(user => user.idUser === idUser);
        // console.log('La consulta del update',consulUser);
        if(consulUser){
            console.log('=============== ACTUALIZANDO USURIO YA EXISTE===============');
            this.list = this.list.filter(user=> user.idWs !== idWs);
            console.log('Lista actualizada desde el update', this.list);
            return
        }

         for(let user of this.list){
              if(user.idWs === idWs ){
                  user.idUser = idUser;
                  user.name = name;
                  user.role = role;
                  user.img = img;
                  break;
              }
         }
 
         console.log('=============== ACTUALIZANDO USURIO===============');
         console.log('La lista desde el update', this.list);

    }

    //Obtener lista de usuarios
    public getList(){
        console.log('Se ejecutó get list')

        return this.list.filter( users => users.name !== '');
    }

    //retornar un usuario
    public getUser(idWs: string){
         return this.list.find(user => user.idWs === idWs );
    }

    // eliminar user
    public removeUser(idWs: string){
        const tempUser = this.getUser(idWs);
        this.list = this.list.filter(user=> user.idWs !== idWs);
        return tempUser;
    }

    public removerDataVacia(){
        this.list = this.list.filter(user=> user.name !== '');
    }


}