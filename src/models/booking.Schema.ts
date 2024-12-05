import { DataTypes, Model } from "sequelize";
import { sequelize } from '../db/sequelize';
import { Integer } from "aws-sdk/clients/apigateway";

class Booking extends Model {
    public id!:string;
    public type!:string;
    public status!:string;
    public property!:string;
    public city!:string;
    public tenants!:string[];
    public monthlyRent!:string;
    public moveinDate!:Date;
    public moveOutData!:Date;
    
    public serviceFee!:string;
    public servicePaymentId!:string;
    public totaltenants!:number;
    public bookingInitiatedBy!:string;
    public bookedBy!:string;
    public bookedByEmail!:string;
    public paySplitCreate!:boolean;
    public cancelReasonHeading!:string;
    public cancleReasonDetails!:string;
}

Booking.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true,
    },
    type:{
        type:DataTypes.STRING,                 //group,single
        allowNull:false
    },
    status:{
        type:DataTypes.STRING,             // tenant_details, document_uploaded,loi_signed,service_fee_paid,document_verified,final_payment_done,contract_signed,booked, cancelled
        allowNull:false
    },
    totaltenants:{
        type:DataTypes.INTEGER,        //total tenants count
        allowNull:false
    },
    property:{
        type:DataTypes.UUID,            //property Id
        allowNull:false
    },
    tenants:{
        type:DataTypes.ARRAY(DataTypes.STRING),      // list of tentants id
    },
    monthlyRent:{
        type:DataTypes.STRING,                 
        allowNull:false
    },
    serviceFee:{
        type:DataTypes.STRING,
        allowNull:false
    },
    servicePaymentId:{
        type:DataTypes.STRING
    },
    moveinDate:{
        type:DataTypes.DATEONLY,
        allowNull:true        
    },
    moveOutData:{
        type:DataTypes.DATEONLY,
        allowNull:true
    },  
    bookedBy:{
        type:DataTypes.UUID,
        references:{
            model:'Users',
            key:'id'
        }
    } ,
    bookedByEmail:{
        type:DataTypes.STRING
    },
    paySplitCreate:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
   
    cancelReasonHeading:{
        type:DataTypes.STRING,
    },
    cancleReasonDetails:{
        type:DataTypes.STRING
    }  


},{
    sequelize,
    modelName:'Booking'
})

export {Booking};