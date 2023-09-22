import { environment } from "src/environments/environment.prod"

export class UserModel {

    constructor(

        public id: string,
        public userName: String,
        public email: String,
        public img: String,
        public role: String,
        public lastSessionDate: Date,
        public temp = false,
        
    ) {}

    getImagen(): any{

        const routeImage = `${environment.base_url}/v1/upload`
        if(!this.img){
            return `${routeImage}/users/no-image`;
        } else if(this.img) {
            return `${routeImage}/users/${this.img}`;
        }
        
    }

    setImg(img: string){
        this.img = img;
        this.temp = true;
    }


}



