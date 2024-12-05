import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize';

class Admin extends Model {
  public id!: string;
  public email!: string;
  public password!: string;
}

Admin.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4,
      primaryKey: true,
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
  },
  {
    sequelize,
    modelName: 'Admin',
  }
);



export { Admin };
