// import { DataTypes, Model } from 'sequelize';
// import { sequelize } from '../db/sequelize';

// class AroundTown extends Model {
//   public id!: string;
//   public name!: string;
//   public heroImage!: string;
//   public about!: string;
//   public photos!: string[];
//   public universities!: string[]; // Fixed typo: "universites" to "universities"
//   public tipImage!: string;
//   public tipData!: string;
//   public tipperName!: string;
//   public tipperDesignation!: string;
//   public food!: {
//     name: string;
//     image: string;
//     googleMapLink: string;
//     rating: string;
//   }[];
//   public places!: {
//     name: string;
//     image: string;
//     googleMapLink: string;
//     rating: string;
//   }[];
// }

// AroundTown.init(
//   {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true,
//     },
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     heroImage: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     about: {
//       type: DataTypes.TEXT, // Assuming the about field can contain longer text, changed to TEXT
//       allowNull: false,
//     },
//     photos: {
//       type: DataTypes.ARRAY(DataTypes.STRING),
//       allowNull: false,
//     },
//     universities: {
//       type: DataTypes.ARRAY(DataTypes.STRING),
//       allowNull: false,
//     },
//     tipImage: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     tipData: {
//       type: DataTypes.TEXT, // Assuming tipData can contain longer text, changed to TEXT
//       allowNull: false,
//     },
//     tipperName: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     tipperDesignation: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     food: {
//       type: DataTypes.ARRAY(DataTypes.JSON), // Assuming food is an array of objects
//       allowNull: false,
//     },
//     places: {
//       type: DataTypes.ARRAY(DataTypes.JSON), // Assuming places is an array of objects
//       allowNull: false,
//     },
//   },
//   {
//     sequelize,
//     modelName: 'AroundTown',
//   }
// );

// export { AroundTown };
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize';

class AroundTown extends Model {
  public id!: string;
  public name!: string;
  public heroImage!: string;
  public about!: string;
  public photos!: string[];
  public universities!: string[];
  public tipImage!: string;
  public tipData!: string;
  public tipperName!: string;
  public tipperDesignation!: string;
  public food!: {
    name: string;
    image: string;
    googleMapLink: string;
    rating: string;
  }[];
  public places!: {
    name: string;
    image: string;
    googleMapLink: string;
    rating: string;
  }[];
}

AroundTown.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    heroImage: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "http://example.com/default-hero.jpg", // Default value
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [], // Default empty array
    },
    universities: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    tipImage: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "http://example.com/default-tip.jpg", // Default value
    },
    tipData: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tipperName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipperDesignation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    food: {
      type: DataTypes.ARRAY(DataTypes.JSON),
      allowNull: false,
      defaultValue: [], // Default empty array
    },
    places: {
      type: DataTypes.ARRAY(DataTypes.JSON),
      allowNull: false,
      defaultValue: [], // Default empty array
    },
  },
  {
    sequelize,
    modelName: 'AroundTown',
  }
);

export { AroundTown };

  