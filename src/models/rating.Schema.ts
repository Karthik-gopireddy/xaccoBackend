import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/sequelize";
import { Property } from "./property.Schema";
import { User } from "./users.Schema";

class Rating extends Model {
  public id!: string;
  public propertyId!: string;
  public userId!: string;
  public comment!: string;
}

Rating.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        key: "id",
        model: Property,
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        key: "id",
        model: User,
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    indexes: [
      {
        unique: true,
        fields: ["propertyId", "userId"],
      },
    ],
    modelName: "Rating",
  }
);

export { Rating };
