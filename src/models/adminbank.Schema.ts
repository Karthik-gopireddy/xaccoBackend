import { DataTypes,Model } from "sequelize";
import { sequelize } from "../db/sequelize";

class AdminBankDetails extends Model{
    public id!:string;
    public beneficiaryName!:string;
    public accountNumber!:string;
    public IFSC!:string;    
    public bankName!:string;        
    public status!:string;        

}

AdminBankDetails.init(
    {
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },      
    beneficiaryName:{
        type:DataTypes.STRING,        
        allowNull:false
    },
    accountNumber:{
        type:DataTypes.STRING,        
        allowNull:false
    },
    IFSC:{
        type:DataTypes.STRING,        
        allowNull:false
    },
    bankName:{
        type:DataTypes.STRING,        
        allowNull:false
    },
    status:{
        type:DataTypes.BOOLEAN,        
        allowNull:false,
        defaultValue:true
    },

},{
    sequelize ,
    modelName:"AdminBankDetails",
}
)

export {AdminBankDetails};