import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize';

class User extends Model {
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public status!:string;
  public wishList!:string[]
}

User.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status:{
      type:DataTypes.STRING,
      allowNull:false,
      defaultValue:'unverified'
    },
    wishList:{
      type:DataTypes.ARRAY(DataTypes.UUID),
      defaultValue:[]
    }
  },

  {
    sequelize,
    modelName: 'User',
  }
);



export { User };
