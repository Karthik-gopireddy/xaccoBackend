import { DataTypes, Model } from "sequelize";
import {sequelize} from "../db/sequelize";
class Contract extends Model{

    public id!:string;
    public bookingId!:string;
    public tenantsId!:string;
    public contract!:string;
    public ipAddress!:string;
}
Contract.init({
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
    contract:{
        type:DataTypes.STRING,
        allowNull:false
    },
    ipAddress:{
        type:DataTypes.STRING,
    }

},{
    sequelize,
    modelName:"Contract"
})

export {Contract}