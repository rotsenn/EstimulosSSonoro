"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerUsuarios = exports.configUser = exports.desconectar = exports.conectarCliente = exports.userOnLine = void 0;
// import Server from '../classes/server.class'; 
const user_list_1 = require("../classes/user-list");
const user_1 = require("../classes/user");
exports.userOnLine = new user_list_1.UserList();
const conectarCliente = (client, io) => {
    const user = new user_1.UserWS(client.id);
    exports.userOnLine.addUser(user);
};
exports.conectarCliente = conectarCliente;
const desconectar = (cliente, io) => {
    cliente.on('disconnect', () => {
        console.log('Cliente desconectado');
        exports.userOnLine.removeUser(cliente.id);
        io.emit('user-connected', exports.userOnLine.getList()); // ver usuarios en linea
    });
};
exports.desconectar = desconectar;
// Configurar usuario
const configUser = (client, io) => {
    client.on('config-user', (payload, callback) => {
        //   console.log('Mensaje recibido', payload);
        exports.userOnLine.updateData(client.id, payload.id, payload.name, payload.role, payload.img);
        io.emit('user-connected', exports.userOnLine.getList());
        //   io.emit('', payload);
        // callback({
        //     ok: true,
        //     payload
        // })
    });
};
exports.configUser = configUser;
// Configurar usuario
const obtenerUsuarios = (client, io) => {
    client.on('get-users', () => {
        //   console.log('Mensaje recibido', payload);
        // io.to(client.id).emit('user-connected', userOnLine.getList());
        io.emit('user-connected', exports.userOnLine.getList());
        //   io.emit('', payload);
    });
};
exports.obtenerUsuarios = obtenerUsuarios;
