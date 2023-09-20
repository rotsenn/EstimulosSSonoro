
export class UserWS {

    public idWs: string;
    public name: string;
    public idUser: string;
    public role: string;
    public img: string;


    constructor(id: string){
        this.idWs = id;
        this.name = '';
        this.idUser = '';
        this.role= '';
        this.img = '';
    }


}