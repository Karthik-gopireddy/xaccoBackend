import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/sequelize";
class Payment extends Model{
    id!:string;
    type!:string;
    meathod!:string;
    amount!:string;
    booking!:string;
    property!:string;
    status!:string;
    paymentProof!:string;
    refundAmount!:string;
    refundedDate!:Date;
    paidBy!:string;
}
Payment.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    type:{
        type:DataTypes.STRING,             // Deposite, Monthly_Rent
        allowNull:false
    },
    meathod:{
        type:DataTypes.STRING,            // offline , online 
        allowNull:false
    },
    amount:{
        type:DataTypes.STRING,
        allowNull:false
    },
    booking:{
        type:DataTypes.UUID,
        references:{
            model:'Bookings',
            key:'id'
        },
        allowNull:false
    },
    property:{
        type:DataTypes.UUID,
        references:{
            model:'Properties',
            key:'id'
        },
        allowNull:false
    },
    status:{
        type:DataTypes.STRING,
        allowNull:false             // approved , pending , denied , refunded
    },
    paymentProof:{
        type:DataTypes.STRING,
        allowNull:false
    },
    refundAmount:{
        type:DataTypes.STRING,
        allowNull:true
    },
    refundedDate:{
        type:DataTypes.DATE,
        allowNull:true
    },
    paidBy:{
        type:DataTypes.STRING,
        allowNull:true
    },
    paidUserName:{
        type:DataTypes.STRING,
        allowNull:true
    }
},{
    sequelize,
    modelName:"Payment"
})

export {Payment};