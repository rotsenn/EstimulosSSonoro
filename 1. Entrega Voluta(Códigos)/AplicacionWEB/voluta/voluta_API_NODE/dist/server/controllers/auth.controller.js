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
const user_model_1 = __importDefault(require("../models/user.model"));
const jwt_1 = require("../helpers/jwt");
const AccountVerification_class_1 = __importDefault(require("../classes/AccountVerification.class"));
const hora_1 = require("../config/hora");
class AuthController {
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            if (!email) {
                return res.status(401).json({
                    ok: false,
                    message: "El email es requerido."
                });
            }
            if (!password) {
                return res.status(401).json({
                    ok: false,
                    message: "El pasword es requerido."
                });
            }
            try {
                // Verificar email
                const usuarioDB = yield user_model_1.default.findOne({ email });
                if (!usuarioDB) {
                    return res.status(404).json({
                        ok: false,
                        msg: 'Usuario o contraseña incorrecto.'
                    });
                }
                if (!usuarioDB.active) {
                    return res.status(401).json({
                        ok: false,
                        msg: "Usuario deshabilitado, comunícate con el administrador."
                    });
                }
                // Verificar contraseña
                const validPassword = bcryptjs_1.default.compareSync(password, usuarioDB.password);
                if (!validPassword) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'Usuario o contraseña incorrecto'
                    });
                }
                if (!usuarioDB.accountActivated) {
                    const accountVerification = new AccountVerification_class_1.default();
                    const hash = accountVerification.createHash();
                    usuarioDB.hash = hash;
                    yield usuarioDB.save();
                    let tokenAccountVerification = yield jwt_1.generateJWTValidateAccount(usuarioDB.id, hash, '20h');
                    let emailEnviado = yield accountVerification.accountUserVerification(usuarioDB.email, tokenAccountVerification, usuarioDB.userName);
                    return res.status(400).json({
                        ok: false,
                        msg: 'Aún no has activado tu cuenta, revisa tu correo y validalo. '
                    });
                }
                const hashSession = new AccountVerification_class_1.default().createHash();
                usuarioDB.hashSession = hashSession;
                usuarioDB.lastSessionDate = usuarioDB.currentSession;
                usuarioDB.currentSession = new hora_1.HoraConfig().horaMenosCinco;
                yield usuarioDB.save();
                // Generar el TOKEN - JWT
                const token = yield jwt_1.generateJWT(usuarioDB.id, hashSession);
                res.json({
                    ok: true,
                    token,
                });
            }
            catch (error) {
                res.status(500).json({
                    ok: false,
                    msg: 'Hable con el administrador',
                    error
                });
            }
        });
    }
    validateAccount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //@ts-ignore
                const uid = req.uid;
                //@ts-ignore 
                const hash = req.hash;
                // Obtener el usuario por UID (Entra por el token)
                const userDB = yield user_model_1.default.findById(uid);
                if (!userDB) {
                    return res.status(403).json({
                        ok: false,
                        msg: ''
                    });
                }
                if (userDB.accountActivated) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'La cuenta ya se encuentra activada.'
                    });
                }
                if (String(userDB.hash) === String(hash)) {
                    userDB.hash = null;
                    userDB.accountActivated = true;
                    yield userDB.save();
                    return res.json({
                        ok: true,
                        msg: 'Cuenta activada con éxito.'
                    });
                }
                else {
                    return res.status(403).json({
                        ok: false,
                        msg: 'El token cambió, por favor trata de iniciar sesión para enviarte una nueva validación por email.'
                    });
                }
            }
            catch (error) {
                res.status(500).json({
                    ok: false,
                    msg: 'Error!,  revisar logs',
                    error
                });
            }
        });
    }
    //Enviar email de recuperacion de contraseña
    passwordReset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                // Obtener el usuario por UID
                const user = yield user_model_1.default.findOne({ email });
                if (!user) {
                    return res.status(403).json({
                        ok: false,
                        msg: 'Email no encontrado, asegúrese de que esté bien escrito.'
                    });
                }
                if (!user.active) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'Usuario inactivo, comuníquese con el administrador.'
                    });
                }
                const accountVerification = new AccountVerification_class_1.default();
                const hash = accountVerification.createHash();
                user.hash = hash;
                yield user.save();
                let tokenRecuperarPassword = yield jwt_1.generateJWTValidateAccount(user._id, hash, '1h');
                let emailEnviado = yield accountVerification.passwordReset(user.email, tokenRecuperarPassword, user.userName);
                if (emailEnviado) {
                    return res.json({
                        ok: true,
                        msg: 'Te enviamos un email para que recuperes tu contraseña.'
                    });
                }
                else {
                    return res.status(403).json({
                        ok: false,
                        msg: 'Algo salió mal, por favor inténtalo nuevamente.'
                    });
                }
            }
            catch (error) {
                res.status(500).json({
                    ok: false,
                    msg: 'Error!,  revisar logs',
                    err: error
                });
            }
        });
    }
    // Validar que el token esté correcto para mostrar formulario de recuperación en front.
    validateTokenNewPassword(req, res) {
        //@ts-ignore
        const uid = req.uid;
        //@ts-ignore 
        const hash = req.hash;
        if (uid && hash) {
            return res.json({
                ok: true,
                msg: 'ok',
            });
        }
        else {
            return res.status(401).json({
                ok: false,
                msg: 'Not',
            });
        }
    }
    // cambiar password por recuperación
    newPasswordReset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //@ts-ignore
            const uid = req.uid;
            //@ts-ignore 
            const hash = req.hash;
            const { password1, password2 } = req.body;
            if (password1 !== password2) {
                return res.status(401).json({
                    ok: false,
                    msg: 'Las contraseñas no coinciden.'
                });
            }
            // Obtener el usuario por UID
            const userDB = yield user_model_1.default.findById(uid);
            if (!userDB) {
                return res.status(403).json({
                    ok: false,
                    msg: ''
                });
            }
            if (String(userDB.hash) === String(hash)) {
                const salt = bcryptjs_1.default.genSaltSync();
                userDB.hash = null;
                userDB.password = bcryptjs_1.default.hashSync(password1, salt),
                    yield userDB.save();
                return res.json({
                    ok: true,
                    msg: 'La nueva contraseña fue creada con éxito.'
                });
            }
            else {
                return res.status(403).json({
                    ok: false,
                    msg: 'El token ha caducado, por favor intenta recuperar contraseña nuevamente.'
                });
            }
        });
    }
    // Renovar token para manejo de sesion en el front
    renewToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //@ts-ignore
            const uid = req.uid;
            //@ts-ignore
            const hashSession = req.hashSession;
            //@ts-ignore
            const user = req.userDB;
            // Generar el TOKEN - JWT
            const token = yield jwt_1.generateJWT(uid, hashSession);
            res.json({
                ok: true,
                token,
                user,
                // menu: getMenuFrontEnd( usuario.role ) 
            });
        });
    }
}
exports.default = AuthController;
