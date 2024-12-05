import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize';

class Enquiry extends Model {
  public id!: string;
  public name!:string;
  public email!: string;
  public phone!: string;
  public type!: string;
}

Enquiry.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4,
      primaryKey: true,
    },
    name:{
      type:DataTypes.STRING,
      
    },
    email: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,      
    },
    phone: {
      type: DataTypes.STRING,
    },   
    status:{
      type:DataTypes.STRING, // new,recontact,enquired
      allowNull:false,
    }
  },
  {
    sequelize,
    modelName: 'Enquiry',
  }
);



export { Enquiry };
