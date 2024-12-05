import { DataTypes,Model } from "sequelize";
import { sequelize } from "../db/sequelize";

class Faq extends Model{
    public id!:string;
    public question!:string;    
    public answer!:string;    
    public status!:boolean;    
}

Faq.init(
    {
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    question:{
        type:DataTypes.STRING,
        allowNull:false
    },  
    answer:{
        type:DataTypes.STRING,
        allowNull:false
    },  
    status:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    },  

},{
    sequelize ,
    modelName:"Faq",
}
)

export {Faq};