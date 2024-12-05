import { DataTypes,Model } from "sequelize";
import { sequelize } from "../db/sequelize";

class SearchTable extends Model {
    public key!:string;
    public value!:string;
    public count!:number;

}

SearchTable.init({
    
   key: {
        type:DataTypes.STRING ,
        allowNull:false,
        unique:true
    },
    value:{
        type:DataTypes.STRING ,
        allowNull:false
    },
    count:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
},{
    sequelize,
    modelName:'Search Table'
})

export {SearchTable}