import { DataTypes, Model } from "sequelize";
import {sequelize} from "../db/sequelize";

class Documents extends Model{
public id!:string;
public booking!:string;
public tentantsId!:string;
public documentName!:string;
public document!:string;
}

Documents.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    booking:{
        type:DataTypes.UUID,
        references:{
            model:'Bookings',
            key:'id' 
        },
        allowNull:false
    },
    documentName:{
        type:DataTypes.STRING,
        allowNull:false

    },
    tentantsId:{
        type:DataTypes.UUID,
        references:{
            model:'Tenants',
            key:'id'
        },
        allowNull:false
    },
    document:{
        type:DataTypes.STRING,
        allowNull:false
    }

},{
    sequelize,
    modelName:"Documents"
})

export {Documents}