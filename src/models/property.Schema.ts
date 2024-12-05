// import { DataTypes, Model } from 'sequelize';
// import { sequelize } from '../db/sequelize';
// import { Rating } from './rating.Schema';

// class Property extends Model {
//     public id!: string;
//     public photos!: string[] | null;
//     public aboutProperty!: string;
//     public name!: string;
//     public type!: string;
//     public buildingType!: string;
//     public bedroom!: integer;
//     public bath!: integer;
//     public resident!: integer;
//     public size!: integer;
//     public minStay?: integer;
//     public price!: integer;
//     public totalPrice!: integer;
//     public priceBreakup!: any[];  // Adjusted to match the new type
//     public ameinties!: string[] | null;
//     public aroundTown!: string;
//     public city!: string;
//     public country!: string;
//     public area!: string;
//     public locationDescription!: string;
//     public threeTour?: string | null;
//     public floorPlan?: string | null;
//     public ttkMessage?: string | null;
//     public ttkVideo?: string | null;
//     public universityAssociated!: string[] | null;
//     public status?: string | null;
//     public serviceFee?: string;
//     public longitude!: integer;
//     public latitude!: integer;
//     public maxmDaysToBookProperty!: integer;
//     public priceInc!: integer[];
//     public extraTopicHeading!: string;
//     public extraTopicDetails!: string;
//     public repairUpto!: string;
//     public accountHolderName!: string;
//     public accountHolderBank!: string;
//     public accountNumber!: string;
// }

// Property.init(
//     {
//         id: {
//             type: DataTypes.UUID,
//             defaultValue: DataTypes.UUIDV4,
//             primaryKey: true
//         },
//         photos: {
//             type: DataTypes.ARRAY(DataTypes.STRING),
//             allowNull: true
//         },
//         name: {
//             type: DataTypes.STRING,
//             allowNull: false
//         },
//         aboutProperty: {
//             type: DataTypes.STRING,
//             allowNull: true
//         },
//         priceBreakup: {
//             type: DataTypes.JSONB,
//             allowNull: true,
//         },
//         type: {
//             type: DataTypes.STRING,
//             allowNull: false
//         },
//         buildingType: {
//             type: DataTypes.STRING,
//             allowNull: false
//         },
//         bedroom: {
//             type: DataTypes.INTEGER,
//             allowNull: false
//         },
//         bath: {
//             type: DataTypes.INTEGER,
//             allowNull: false
//         },
//         resident: {
//             type: DataTypes.INTEGER,
//             allowNull: false
//         },
//         size: {
//             type: DataTypes.INTEGER,
//             allowNull: false
//         },
//         minStay: {
//             type: DataTypes.INTEGER,
//         },
//         price: {
//             type: DataTypes.INTEGER,
//             allowNull: false
//         },
//         totalPrice: {
//             type: DataTypes.INTEGER,
//             allowNull: false
//         },
//         ameinties: {
//             type: DataTypes.ARRAY(DataTypes.STRING)
//         },
//         aroundTown: {
//             type: DataTypes.UUID
//         },
//         city: {
//             type: DataTypes.UUID,
//             references: {
//                 model: 'Cities',
//                 key: 'id'
//             },
//             allowNull: false
//         },
//         country: {
//             type: DataTypes.STRING,
//             allowNull: false
//         },
//         area: {
//             type: DataTypes.STRING,
//             allowNull: false
//         },
//         locationDescription: {
//             type: DataTypes.STRING,
//             allowNull: false
//         },
//         threeTour: {
//             type: DataTypes.STRING,
//             allowNull: true
//         },
//         floorPlan: {
//             type: DataTypes.STRING,
//             allowNull: true
//         },
//         ttkMessage: {
//             type: DataTypes.STRING,
//             allowNull: true
//         },
//         ttkVideo: {
//             type: DataTypes.STRING,
//             allowNull: true
//         },
//         universityAssociated: {
//             type: DataTypes.ARRAY(DataTypes.UUID),
//         },
//         status: {
//             type: DataTypes.STRING,
//             defaultValue: 'available'
//         },
//         serviceFee: {
//             type: DataTypes.STRING,
//             allowNull: false
//         },
//         longitude: {
//             type: DataTypes.INTEGER
//         },
//         latitude: {
//             type: DataTypes.INTEGER
//         },
//         maxmDaysToBookProperty: {
//             type: DataTypes.INTEGER
//         },
//         priceInc: {
//             type: DataTypes.ARRAY(DataTypes.INTEGER)
//         },
//         extraTopicHeading:{
//             type: DataTypes.STRING
//        },
//        extraTopicDetails:{
//         type: DataTypes.STRING
//        },
//        repairUpto:{
//         type: DataTypes.STRING
//        },
//        accountHolderName:{
//         type: DataTypes.STRING,
//        },
//        accountHolderBank:{
//         type: DataTypes.STRING
//        },
//        accountNumber:{
//         type: DataTypes.STRING
//        }
//     },
//     {
//         sequelize,
//         modelName: 'Property',
//     }
// );

// Property.hasMany(Rating, { foreignKey: 'propertyId', as: 'PropertyRating' });

// export { Property };

import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize';
import { Rating } from './rating.Schema';

class Property extends Model {
    public id!: string;
    public photos!: string[] | null;
    public aboutProperty!: string;
    public name!: string;
    public type!: string;
    public buildingType!: string;
    public bedroom!: number;
    public bath!: number;
    public resident!: number;
    public size!: number;
    public minStay?: number;
    public price!: number;
    public totalPrice!: number;
    public priceBreakup!: any[];  // Adjusted to match the new type
    public ameinties!: string[] | null;
    public aroundTown!: string;
    public city!: string;
    public country!: string;
    public area!: string;
    public locationDescription!: string;
    public threeTour?: string | null;
    public floorPlan?: string | null;
    public ttkMessage?: string | null;
    public ttkVideo?: string | null;
    public universityAssociated!: string[] | null;
    public status?: string | null;
    public serviceFee?: string;
    public longitude!: number;  // Changed to number
    public latitude!: number;   // Changed to number
    public maxmDaysToBookProperty!: number;
    public priceInc!: number[];
    public extraTopicHeading!: string;
    public extraTopicDetails!: string;
    public repairUpto!: string;
    public accountHolderName!: string;
    public accountHolderBank!: string;
    public accountNumber!: string;
}

Property.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        photos: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        aboutProperty: {
            type: DataTypes.STRING,
            allowNull: true
        },
        priceBreakup: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        buildingType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        bedroom: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        bath: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        resident: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        minStay: {
            type: DataTypes.INTEGER,
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        totalPrice: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        ameinties: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        aroundTown: {
            type: DataTypes.UUID
        },
        city: {
            type: DataTypes.UUID,
            references: {
                model: 'Cities',
                key: 'id'
            },
            allowNull: false
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false
        },
        area: {
            type: DataTypes.STRING,
            allowNull: false
        },
        locationDescription: {
            type: DataTypes.STRING,
            allowNull: false
        },
        threeTour: {
            type: DataTypes.STRING,
            allowNull: true
        },
        floorPlan: {
            type: DataTypes.STRING,
            allowNull: true
        },
        ttkMessage: {
            type: DataTypes.STRING,
            allowNull: true
        },
        ttkVideo: {
            type: DataTypes.STRING,
            allowNull: true
        },
        universityAssociated: {
            type: DataTypes.ARRAY(DataTypes.UUID),
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'available'
        },
        serviceFee: {
            type: DataTypes.STRING,
            allowNull: false
        },
        longitude: {
            type: DataTypes.FLOAT  // Changed to FLOAT
        },
        latitude: {
            type: DataTypes.FLOAT  // Changed to FLOAT
        },
        maxmDaysToBookProperty: {
            type: DataTypes.INTEGER
        },
        priceInc: {
            type: DataTypes.ARRAY(DataTypes.INTEGER)
        },
        extraTopicHeading:{
            type: DataTypes.STRING
       },
       extraTopicDetails:{
        type: DataTypes.STRING
       },
       repairUpto:{
        type: DataTypes.STRING
       },
       accountHolderName:{
        type: DataTypes.STRING,
       },
       accountHolderBank:{
        type: DataTypes.STRING
       },
       accountNumber:{
        type: DataTypes.STRING
       }
    },
    {
        sequelize,
        modelName: 'Property',
    }
);

Property.hasMany(Rating, { foreignKey: 'propertyId', as: 'PropertyRating' });

export { Property };
