import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize';

class University extends Model {
  public id!: string;
  public name!: string;
  public city!: string;
  public country!:string;
  public logo!:string;
}

University.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country:{
        type:DataTypes.STRING,
        allowNull:false
    },
    logo:{
        type:DataTypes.STRING,
        allowNull:false
    }
  },
  {
    sequelize,
    indexes:[
        {
            unique:true,
            fields:['name','city']
        }
    ],
    modelName: 'University',
  }
);



export { University };
