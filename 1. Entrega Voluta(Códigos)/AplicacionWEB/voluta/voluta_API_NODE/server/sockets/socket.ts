import { Socket } from 'socket.io';
import socketIO from 'socket.io';
// import Server from '../classes/server.class'; 
import { UserList } from '../classes/user-list';
import { UserWS } from '../classes/user';
import { ieNoOpen } from 'helmet';


export const userOnLine = new UserList();

export const conectarCliente = ( client: Socket, io: socketIO.Server ) => {

    const user = new UserWS(client.id);
    userOnLine.addUser(user);

    
}

export const desconectar = ( cliente: Socket , io: socketIO.Server) => {

       cliente.on('disconnect',()=>{
           console.log('Cliente desconectado');
           userOnLine.removeUser(cliente.id);

           io.emit('user-connected', userOnLine.getList()); // ver usuarios en linea


       });
       
}



// Configurar usuario
export const configUser = ( client: Socket, io: socketIO.Server ) => {

    client.on('config-user', ( payload: any, callback: Function ) => {
        //   console.log('Mensaje recibido', payload);

        userOnLine.updateData(client.id,payload.id,payload.name,payload.role,payload.img)
        io.emit('user-connected', userOnLine.getList()); 
        //   io.emit('', payload);
        // callback({
        //     ok: true,
        //     payload
        // })
    })
}


// Configurar usuario
export const obtenerUsuarios = ( client: Socket, io: socketIO.Server ) => {

    client.on('get-users', ( ) => {
        //   console.log('Mensaje recibido', payload);

        // io.to(client.id).emit('user-connected', userOnLine.getList());
        io.emit('user-connected', userOnLine.getList()); 
        //   io.emit('', payload);

    })
}

























