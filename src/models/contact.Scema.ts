import { DataTypes,Model } from "sequelize";
import { sequelize } from "../db/sequelize";

class Contact extends Model{
    public id!:string;
    public email!:string;   
    public name!:string;   
    public phone!:string;   
    public type!:string;   
    public enquiry!:string;   
    public firstname!:string;   
    public lastname!:string;   
    public who!:string;   
    public source!:string;   
}

Contact.init(
    {
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false
    },
    firstname:{
        type:DataTypes.STRING,        
    },
    lastname:{
        type:DataTypes.STRING,        
    },
    who:{
        type:DataTypes.STRING,        
    },
    source:{
        type:DataTypes.STRING,        
    },
    type:{
        type:DataTypes.STRING,
        allowNull:false
    },
    name:{
        type:DataTypes.STRING,        
    },
    phone:{
        type:DataTypes.STRING,        
    },
    enquiry:{
        type:DataTypes.STRING,
    },

},{
    sequelize ,
    modelName:"Contact",
}
)

export {Contact};