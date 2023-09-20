"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserList = void 0;
class UserList {
    constructor() {
        this.list = [];
    }
    // agregar usuario
    addUser(user) {
        this.list.push(user);
        console.log('Entra', this.list);
        return user;
    }
    updateData(idWs, idUser, name, role, img) {
        // console.log('LLega para edición', idWs, idUser, name, role, img)
        let consulUser = this.list.find(user => user.idUser === idUser);
        // console.log('La consulta del update',consulUser);
        if (consulUser) {
            console.log('=============== ACTUALIZANDO USURIO YA EXISTE===============');
            this.list = this.list.filter(user => user.idWs !== idWs);
            console.log('Lista actualizada desde el update', this.list);
            return;
        }
        for (let user of this.list) {
            if (user.idWs === idWs) {
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
    getList() {
        console.log('Se ejecutó get list');
        return this.list.filter(users => users.name !== '');
    }
    //retornar un usuario
    getUser(idWs) {
        return this.list.find(user => user.idWs === idWs);
    }
    // eliminar user
    removeUser(idWs) {
        const tempUser = this.getUser(idWs);
        this.list = this.list.filter(user => user.idWs !== idWs);
        return tempUser;
    }
    removerDataVacia() {
        this.list = this.list.filter(user => user.name !== '');
    }
}
exports.UserList = UserList;
