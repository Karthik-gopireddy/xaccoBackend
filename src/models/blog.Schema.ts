import { DataTypes,Model } from "sequelize";
import { sequelize } from "../db/sequelize";

class Blogs extends Model{
    public id!:string;
    public heading!:string;
    public category!:string;
    public description!:string;    
    public bannerImage!:string;    
    public image!:string;    
}

Blogs.init(
    {
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    heading:{
        type:DataTypes.STRING,
        allowNull:false
    },
    category:{
        type:DataTypes.STRING,
        allowNull:false
    },
    description:{
        type:DataTypes.STRING,       
    },
    bannerImage:{
        type:DataTypes.STRING,
        allowNull:false
    },
    image:{
        type:DataTypes.STRING,        
    },

},{
    sequelize ,
    modelName:"Blogs",
}
)

export {Blogs};