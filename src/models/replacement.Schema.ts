import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/sequelize";
import { Property } from "./property.Schema";
import { User } from "./users.Schema";

class Replacement extends Model {
  public id!: string;  
  public comment!: string;  
  public name!: string;  
  public email!: string;  
  public reason!: string;  
  public tenantDetailsAdded!: boolean;  
  public documentUploaded!: boolean;  
  public passport!: string;  
  public loiPending!: boolean;  
  public serviceFeePaid!: boolean;  
  public status!: string;  
  public booking!: string;  
  public replaceFrom!: string;  
  public replaceTo!: string;  
  public documents!: { name: string, url: string }[];
  public contractSignedPending!:boolean;
}

Replacement.init(
  {
    id:{
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },         
    comment:{
      type: DataTypes.STRING,
      allowNull: true,
    },    
    contractSignedPending:{
      type:DataTypes.BOOLEAN,
      allowNull:true        
  },
    serviceFeePaid:{
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },    
    name:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    documents: {
      type: DataTypes.JSON, // Use JSON data type to store an array of objects
      allowNull: true,
    },
    tenantDetailsAdded:{
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    documentUploaded:{
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    email:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    passport:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    loiPending:{
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    reason:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    status:{
      type: DataTypes.STRING,
      defaultValue:"pending"
    },
    booking:{
        type:DataTypes.UUID,
        references:{
            model:'Bookings',
            key:'id'
        }
    },
    replaceFrom:{
        type:DataTypes.UUID,
        references:{
            model:'Tenants',
            key:'id'
        }
    },
    replaceTo:{
        type:DataTypes.UUID,
        references:{
            model:'Tenants',
            key:'id'
        }
    },
  },
  {
    sequelize,    
    modelName: "Replacement",
  }
);

export { Replacement };
