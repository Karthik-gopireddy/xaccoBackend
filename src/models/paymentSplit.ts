import { DataTypes, Model, STRING } from "sequelize";
import {sequelize} from "../db/sequelize";
class PaySplit extends Model{

    public id!:string;
    public bookingId!:string;
    public tenantsId!:string;
    public amount!:string;
    public type!:string;
    public paymentStatus!:string;
}
PaySplit.init({
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
    type:{
        type:STRING,
        allowNull:false
    },
    amount:{
        type:DataTypes.STRING,
        allowNull:false
    },
    paymentStatus:{
        type:DataTypes.STRING,    //unpaid,pending--> to be approve by admin  ,paid
        allowNull:false
    }

},{
    sequelize,
    modelName:"PaySplit"
})

export {PaySplit}