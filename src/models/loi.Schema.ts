import { DataTypes, Model } from "sequelize";
import {sequelize} from "../db/sequelize";
class LOI extends Model{

    public id!:string;
    public bookingId!:string;
    public tenantsId!:string;
    public loi!:string;
    public ipAddress!:string;
}
LOI.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    bookingId:{
        type:DataTypes.UUID,
        references:{
            model:'Bookings',
            key:'id' 
        },
        allowNull:false
    },
    tenantsId:{
        type:DataTypes.UUID,
        references:{
            model:'Tenants',
            key:'id'
        },
        allowNull:false
    },
    loi:{
        type:DataTypes.STRING,
        allowNull:false
    },
    ipAddress:{
        type:DataTypes.STRING,
    }

},{
    sequelize,
    modelName:"LOI"
})

export {LOI}