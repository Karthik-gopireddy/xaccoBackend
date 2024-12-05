import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/sequelize";
class Tenant extends Model{
    public id!:string;
    public email!:string;
    public passport!:string;
    public booking!:string;
    public documentStatus!:string;
    public documentList !:object[];
    public name!:string;
    public reason!:string;
    public loiUploaded!:boolean;
    public contractSigned!:boolean;
    public active!:boolean;
    public loi!:string;
    public contract!:string;
}
Tenant.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    name:{
        type:DataTypes.STRING
    },
    reason:{
        type:DataTypes.STRING
    },
    booking:{
        type:DataTypes.UUID,
        references:{
            model:'Bookings',
            key:'id' 
        },
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    active:{
        type:DataTypes.BOOLEAN,
        defaultValue:true        
    },
    passport:{
        type:DataTypes.STRING,
    },
    documentStatus:{
        type:DataTypes.STRING,
        allowNull:false,
        defaultValue:'Pending'
    },
    documentList:{
        type:DataTypes.ARRAY(DataTypes.JSON)
    },
    loiUploaded:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    contractSigned:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    loi:{
        type:DataTypes.STRING,
    },
    contract:{
        type:DataTypes.STRING,
    }

},{
    sequelize,
    modelName:"Tenant",
    indexes:[
        {
            unique:true,
            fields:['email','booking']
        }
    ]
})

export {Tenant};