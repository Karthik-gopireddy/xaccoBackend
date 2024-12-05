import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/sequelize";
class Verifiaction extends Model{
    public email!:string;
    public code!:string;
    public updatedAt: Date;
}

Verifiaction.init({
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
        references:{
            model:'Users',
            key:'email'
        }
    },
    code:{
        type:DataTypes.STRING,
        allowNull:true,
        unique:true
    }
},{
    sequelize,
    modelName:'Verification'
})

export {Verifiaction};