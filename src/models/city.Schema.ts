import { DataTypes,Model } from "sequelize";
import { sequelize } from "../db/sequelize";

class City extends Model{
    public id!:string;
    public name!:string;
    public country!:string;
    public countryCode!:string;    
    public currencyIcon!:string;    
    public currencyCode!:string;    
    public cardImage!:string;    
    public images!:string[];
    public about!:string;
    public documentNeeded!:object[];    
    public cityIcon!:object[];    
  length: any;
}

City.init(
    {
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    cardImage:{
        type:DataTypes.STRING,        
    },
    currencyCode:{
        type:DataTypes.STRING,
        allowNull:false
    },
    currencyIcon:{
        type:DataTypes.STRING,
        allowNull:false
    },
    cityIcon:{
        type:DataTypes.STRING,        
    },
    country:{
        type:DataTypes.STRING,
        allowNull:false
    },
    countryCode:{
        type:DataTypes.STRING,
        allowNull:false
    },
    images:{
        type:DataTypes.ARRAY(DataTypes.STRING)
    },
    about:{
        type:DataTypes.TEXT
    },
    documentNeeded:{
        type:DataTypes.ARRAY(DataTypes.JSON)
    }


},{
    sequelize ,
    modelName:"City",
    indexes: [
        {
          unique: true,
          fields: ["name", "country"],
        },
      ],

}
)

export {City};