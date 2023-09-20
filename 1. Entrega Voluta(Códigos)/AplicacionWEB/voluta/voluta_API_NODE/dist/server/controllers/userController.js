"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const moment_1 = __importDefault(require("moment"));
const user_model_1 = __importDefault(require("../models/user.model"));
const jwt_1 = require("../helpers/jwt");
const AccountVerification_class_1 = __importDefault(require("../classes/AccountVerification.class"));
const mongoose_1 = require("mongoose");
const socket_1 = require("../sockets/socket");
moment_1.default.locale('es');
class UserController {
    createUserIni(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.query.pass || req.query.pass !== 'SROLE' || req.query.pass === undefined) {
                return res.status(403).json({
                    ok: true,
                    msg: 'No es posible crear el usuario.'
                });
            }
            const salt = bcryptjs_1.default.genSaltSync();
            let user = {
                userName: 'root',
                email: 'root@root.com',
                password: bcryptjs_1.default.hashSync('S0p0rt3', salt),
                role: 'SUPER_ROLE',
                accountActivated: true,
                hash: '',
                user: '61523d9662c92e002e486be4',
                createdAtTMP: moment_1.default().unix()
            };
            let existUserName = yield user_model_1.default.findOne({ userName: 'root' });
            if (existUserName) {
                return res.status(403).json({
                    ok: false,
                    msg: 'El usuario ya fue creado.'
                });
            }
            let newUserSuperRole = yield user_model_1.default.create(user);
            if (!newUserSuperRole) {
                return res.status(403).json({
                    ok: true,
                    msg: 'No se pudo crear el usuario, intentalo nuevamente.'
                });
            }
            return res.json({
                ok: true,
                msg: 'Usuario root creado con exito'
            });
        });
    }
    getUser(req, res) {
        let userId = req.params.id;
        if (!mongoose_1.isValidObjectId(userId)) {
            return res.status(500).json({
                ok: false,
                msg: 'Error en la petición.'
            });
        }
        user_model_1.default.findById(userId, (err, user) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }
            if (!user) {
                return res.status(404).json({
                    ok: false,
                    msg: 'El usuario no existe.'
                });
            }
            return res.json({
                ok: true,
                user
            });
        });
    }
    getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Validar permisos para esta acción
            let active = req.query.active;
            let items = 15;
            let itemsPerPage = items;
            let page = Number(req.query.page) || 1;
            page = Number(page - 1);
            let desde = page * items;
            desde = Number(desde);
            if (!active) { }
            else {
                if (active === 'true' || active === 'false') { }
                else {
                    return res.status(403).json({
                        ok: false,
                        msg: 'active incorrecto'
                    });
                }
            }
            let activ = true;
            if (active === 'false') {
                console.log('entró');
                activ = false;
            }
            user_model_1.default.find({ active: activ })
                .sort({ created: -1 })
                .skip(desde)
                .limit(items)
                .exec((err, users) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                user_model_1.default.countDocuments({ active: activ }, (err, count) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            err
                        });
                    }
                    res.json({
                        ok: true,
                        total: count,
                        pages: Math.ceil(count / itemsPerPage),
                        users
                    });
                });
            });
        });
    }
    disableAndEnableUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userID } = req.body;
            //@ts-ignore
            let user = req.uid;
            if (!userID || !mongoose_1.isValidObjectId(userID)) {
                return res.status(401).json({
                    ok: false,
                    msg: 'El usuario a inhabilitar es requerido.'
                });
            }
            try {
                let userDB = yield user_model_1.default.findById(userID);
                if (!userDB) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'El usuario no existe'
                    });
                }
                console.log(String(userDB._id) === String(userID));
                if (String(userDB._id) === String(user)) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'Ey! el mismo usuario no se puede inhabilitar'
                    });
                }
                if (userDB.role === "SUPER_ROLE") {
                    return res.status(401).json({
                        ok: false,
                        msg: 'Este usuario no se puede inhabilitar'
                    });
                }
                let actionSelected = '';
                if (!userDB.active) {
                    userDB.active = true;
                    actionSelected = 'habilitado';
                }
                else {
                    userDB.active = false;
                    actionSelected = 'inhabilitado';
                }
                yield userDB.save();
                res.json({
                    ok: true,
                    msg: `Usuario ${actionSelected} con exito`
                });
            }
            catch (error) {
                res.status(500).json({
                    ok: false,
                    error,
                    msg: 'Error inesperado... revisar logs'
                });
            }
        });
    }
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId = req.params.user;
            const { name, email, role, } = req.body;
            try {
                if (!mongoose_1.isValidObjectId(userId)) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'Usuario invalido'
                    });
                }
                if (role === 'ADMIN_ROLE' || role === 'USER_ROLE') { }
                else {
                    return res.status(403).json({
                        ok: false,
                        msg: 'Ey! rol invalido.  Roles validos: (ADMIN_ROLE y USER_ROLE)'
                    });
                }
                let userDB = yield user_model_1.default.findById(userId);
                if (!userDB) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'El usuario no existe'
                    });
                }
                if (userDB.email === email) {
                    delete userDB.email;
                }
                const accountVerification = new AccountVerification_class_1.default();
                let newHash = '';
                if (userDB.email !== email) {
                    const emailExist = yield user_model_1.default.findOne({ email });
                    if (emailExist) {
                        return res.status(401).json({
                            ok: false,
                            msg: 'El Email ingresado ya se encuentra registrado'
                        });
                    }
                    newHash = accountVerification.createHash();
                    userDB.userName = name;
                    userDB.email = email;
                    userDB.role = role;
                    userDB.accountActivated = false;
                    yield userDB.save();
                    let tokenAccountVerification = yield jwt_1.generateJWTValidateAccount(userId, newHash, '10h');
                    yield accountVerification.accountUserVerification(email, tokenAccountVerification, name);
                    return res.json({
                        ok: true,
                        msg: 'Usuario actualizado con éxito, se enviará un email para que active la cuenta.'
                    });
                }
                userDB.userName = name;
                userDB.role = role;
                yield userDB.save();
            }
            catch (error) {
                return res.status(500).json({
                    ok: false,
                    msg: 'No se pudo actualizar el usuario, intentalo nuevamente.'
                });
            }
        });
    }
    //////////////CREAR USUARIO  SOLO ADMIN_ROLE y SUPER_ROLE LO CREA
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //@ts-ignore
            let uid = req.uid || '';
            const { name, email, role, } = req.body;
            try {
                if (role === 'ADMIN_ROLE' || role === 'USER_ROLE') { }
                else {
                    return res.status(403).json({
                        ok: false,
                        msg: 'Ey! rol invalido.  Roles validos: (ADMIN_ROLE y USER_ROLE)'
                    });
                }
                console.log('Filtro de roles');
                const emailExist = yield user_model_1.default.findOne({ email });
                if (emailExist) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'El Email ingresado ya se encuentra registrado'
                    });
                }
                console.log('Existe email', emailExist);
                const accountVerification = new AccountVerification_class_1.default();
                const hash = accountVerification.createHash();
                const salt = bcryptjs_1.default.genSaltSync();
                let user = {
                    userName: name,
                    email,
                    password: bcryptjs_1.default.hashSync('123', salt),
                    role,
                    hash,
                    user: uid,
                    createdAtTMP: moment_1.default().unix()
                };
                // Guardar user
                let newUser = yield user_model_1.default.create(user);
                if (!newUser) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'El usuario no se pudo crear, intentalo nuevamente.'
                    });
                }
                let tokenAccountVerification = yield jwt_1.generateJWTValidateAccount(newUser._id, hash, '10h');
                yield accountVerification.accountUserVerification(email, tokenAccountVerification, name);
                res.json({
                    ok: true,
                    user,
                    msg: 'Usuario creado con éxito, se enviará un email para que active la cuenta.'
                });
            }
            catch (error) {
                console.log(error);
                res.status(500).json({
                    ok: false,
                    error,
                    msg: 'Error inesperado... revisar logs'
                });
            }
        });
    }
    searchUser(req, res) {
        let termino = req.params.term;
        let active = req.query.active;
        let regex = new RegExp(termino, 'i');
        if (!termino) {
            return;
        }
        if (!active) { }
        else {
            if (active === 'true' || active === 'false') { }
            else {
                return res.status(403).json({
                    ok: false,
                    msg: 'active incorrecto'
                });
            }
        }
        let activ = true;
        if (active === 'false') {
            console.log('entró');
            activ = false;
        }
        user_model_1.default.find({ $and: [{ active: activ }, { userName: regex }] })
            .limit(24)
            .exec((err, users) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error en la petición.'
                });
            }
            return res.json({
                ok: true,
                users
            });
        });
    }
    //////////////EDITAR USUARIO  SOLO ADMIN_ROLE y SUPER_ROLE EDITA EMAIL Y ROLE
    userUpdate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let userID = req.params.id;
            //@ts-ignore
            let user = req.userDB; // Datos del usuario que trata de hacer la actualizacion
            if (!mongoose_1.isValidObjectId(userID)) {
                return res.status(404).json({
                    ok: false,
                    msg: 'User invalido'
                });
            }
            const { name, email, role } = req.body;
            let data = { name, email, role };
            try {
                let userUpdate = yield user_model_1.default.findById(userID); // consulta de usuario que se va a actualizar.
                if (!userUpdate) {
                    return res.status(404).json({
                        ok: false,
                        msg: 'El usuario no existe.'
                    });
                }
                if (user.role === 'USER_ROLE') {
                    if (user._id === userUpdate._id) {
                        delete data.email;
                        delete data.role;
                        delete userUpdate.email;
                        delete userUpdate.role;
                        userUpdate.userName = name;
                        yield userUpdate.save();
                        return res.json({
                            ok: true,
                            msg: 'Usuario actualizado exitosamente.'
                        });
                    }
                    else {
                        return res.status(401).json({
                            ok: false,
                            msg: 'Sin permisos para esta acción.'
                        });
                    }
                }
                else if (user.role === 'SUPER_ROLE' || user.role === 'ADMIN_ROLE') {
                    userUpdate.userName = name;
                    userUpdate.role = role;
                    if (email === userUpdate.email) {
                        delete userUpdate.email;
                    }
                    else {
                        userUpdate.email = email;
                        userUpdate.accountActivated = false;
                        const accountVerification = new AccountVerification_class_1.default();
                        let newHash = accountVerification.createHash();
                        userUpdate.hash = newHash;
                        yield userUpdate.save();
                        let tokenAccountVerification = yield jwt_1.generateJWTValidateAccount(userID, newHash, '10h');
                        yield accountVerification.accountUserVerification(email, tokenAccountVerification, name);
                        return res.json({
                            ok: true,
                            msg: 'Usuario Actualizado con éxito',
                        });
                    }
                    yield userUpdate.save();
                    return res.json({
                        ok: true,
                        msg: 'Usuario Actualizado con éxito',
                    });
                }
                else {
                    return res.status(401).json({
                        ok: false,
                        msg: 'Sin permisos para esta acción.'
                    });
                }
            }
            catch (error) {
                res.status(500).json({
                    ok: false,
                    error,
                    msg: 'No se pudo actualizar el usuario intentalo de nuevo. '
                });
            }
        });
    }
    changePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //@ts-ignore
            let user = req.uid;
            let { passActual, passNuevo, passValidacion } = req.body;
            try {
                let userDB = yield user_model_1.default.findById(user);
                if (!userDB) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'Ey! El usuario no existe. '
                    });
                }
                const validPassword = bcryptjs_1.default.compareSync(passActual, userDB.password);
                if (!validPassword) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'Contraseña actual incorrecta.'
                    });
                }
                if (passNuevo !== passValidacion) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'Ey! Las contraseñas no coinciden. '
                    });
                }
                const salt = bcryptjs_1.default.genSaltSync();
                userDB.password = bcryptjs_1.default.hashSync(passNuevo, salt),
                    yield userDB.save();
                return res.json({
                    ok: true,
                    msg: 'Contraseña actualizada con éxito'
                });
            }
            catch (error) {
                res.status(500).json({
                    ok: false,
                    error,
                    msg: 'Ey! No se pudo actualizar la contraseña. '
                });
            }
        });
    }
    updateUserName(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //@ts-ignore
            let userId = req.uid;
            let _user = req.params.user;
            let userName = req.body.name;
            console.log(req.body);
            try {
                if (!mongoose_1.isValidObjectId(_user)) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'Usuario invalido'
                    });
                }
                if (userName === '' || userName === undefined) {
                    return res.status(401).json({
                        ok: true,
                        msg: 'El nombre de usuario es requerido'
                    });
                }
                if (String(userId) !== String(userId)) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'No tienes permisos para realizar la acción;'
                    });
                }
                let userDb = yield user_model_1.default.findById(_user);
                if (!userDb) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'Ey! el usuario no existe.'
                    });
                }
                userDb.userName = userName;
                yield userDb.save();
                res.json({
                    ok: true,
                    msg: 'Nombre de usuario actualizado con éxito.',
                    user: userDb
                });
            }
            catch (error) {
                console.log(error);
                return res.status(401).json({
                    ok: false,
                    msg: 'Ey! No se pudo guardar el nombre de usuario, intentalo de nuevo.',
                });
            }
        });
    }
    usersOnLine(req, res) {
        let usersOnLine = socket_1.userOnLine;
        return res.json({
            ok: true,
            usersOnLine
        });
    }
}
exports.default = UserController;
