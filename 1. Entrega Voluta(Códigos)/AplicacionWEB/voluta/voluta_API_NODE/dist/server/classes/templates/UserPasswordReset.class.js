"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../../config/config");
// Plantillas de autenticacion para  email
class UserPasswordReset {
    constructor(token, userName) {
        this.token = token;
        this.userName = userName;
    }
    templatePasswordReset() {
        return `

		<div>
		<table align="center" cellpadding="0" cellspacing="0" style="height:100%;width:700px;font-family:'Roboto','Helvetica Neue','Helvetica','Arial',sans-serif;margin:0 auto">
			<tbody>
				<tr>
					<td align="center">
						<table height="100%" align="center" cellpadding="0" cellspacing="0" style="font-family:'Roboto','Helvetica Neue','Helvetica','Arial',sans-serif;margin:0 auto;width:700px;min-height:400px">
							<tbody>
	
								<tr>
									<td>
										<div style="padding:0px 40px;font-size:12px">
											<div style="text-align:left"><strong>Estimado (a) ${this.userName}.</strong></div>
											<div style="text-align:left"><strong>Reciba un cordial saludo.</strong></div>
											<div style="text-align:left">&nbsp;</div>
											<div style="text-align:left">Usted ha solicitado restablecer su contraseña de inicio de sesion en VOLUTA, para continuar da click en el siguiente enlace: </div>
											<div>&nbsp;</div>
											<div style="text-align:left"> <a href="${config_1.urlEmails.accountRecuperarPassword}${this.token}" target="_blank" data-saferedirecturl="">RESTABLECER MI CONTRASEÑA</a>.</div>
											<div style="text-align:left">&nbsp;</div>
											<div style="text-align:left; color: red">
												Si no ha asociado su dirección a una cuenta de VOLUTA, ignore este mensaje y no haga clic en el enlace. 
											</div>
	
										</div>
									</td>
								</tr>
							</tbody>
						</table>
						<table>
							<tbody>
								<tr>
									<td style="font-size:10px;padding:10px 0px;text-align:justify">
										Este mensaje puede contener información privilegiada o confidencial que solo puede ser utilizada por su destinatario. Si usted no es el destinatario autorizado, cualquier modificación, retención, difusión, distribución o copia total o parcial de este
										mensaje y/o de la información contenida en el mismo y/o en sus archivos anexos está prohibida y son sancionadas por la ley. Si por error recibe este mensaje, le ofrecemos disculpas, sírvase borrarlo de inmediato, notificarle
										de su error a la persona que lo envió y abstenerse de divulgar su contenido y anexos.
									</td>
								</tr>
							</tbody>
						</table>
					</td>
				</tr>
			</tbody>
		</table>
	</div> `;
    }
}
exports.default = UserPasswordReset;
