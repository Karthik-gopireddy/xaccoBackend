import { Request, Response } from "express";
import { dateForWhichPropertyBooked } from "./propertyController";
import { BUFFER_DAY } from "../utils/Constants";
import { Property } from "../models/property.Schema";
// import { BUFFER_DAY } from "../utils/Constants";
interface DateWithPrice {
  uptoDate: Date;
  price: number;
}
export const getPrice= async(id:unknown,checkInDate:Date) =>
{
  console.log(checkInDate)
    const bookedDates = await dateForWhichPropertyBooked(id);
    console.log(bookedDates)
    if (bookedDates == "Error While checking property") {
      return "Error While checking property";
    }
    bookedDates.sort((a, b) => b.endDate.getTime() - a.endDate.getTime());

    let lastBookingEndDate =
      bookedDates.length > 0 ? new Date(bookedDates[0].endDate)<new Date() ?null: bookedDates[0].endDate : null;


    if (lastBookingEndDate != null) {
      lastBookingEndDate = new Date(
        lastBookingEndDate.getTime() + BUFFER_DAY * 24 * 60 * 60 * 1000
      );
    } else {
      lastBookingEndDate = new Date();
    }

    if (checkInDate <= lastBookingEndDate) {
      return "check in date not available" ;
    }
    const property = await Property.findOne({
      where: { id: id },
    });
    let dynamicPrice
    if(typeof(property.totalPrice)==="string"){
      dynamicPrice = parseInt(property.totalPrice) ;    
    }else{
      dynamicPrice = property.totalPrice;    
    }
    console.log(dynamicPrice,111);
    
    
    if(property.maxmDaysToBookProperty !==0)
    {
      let isDateAvailable =false;
      for(let i=0;i<property.maxmDaysToBookProperty;i++)
      {
        if(checkInDate <= new Date(lastBookingEndDate.getTime() +(i+1)*24*60*60*1000))
        {
          dynamicPrice = dynamicPrice + (property.priceInc[i]/100) * dynamicPrice;
          isDateAvailable=true;
          break;
        }
      }
      if(!isDateAvailable)
      {
        return `Cant Book property beyond ${property.maxmDaysToBookProperty} days`;

      }
    }
    else{
      if (
        checkInDate <=
        new Date(lastBookingEndDate.getTime() + 3 * 24 * 60 * 60 * 1000)
      ) {
      } else if (
        checkInDate <=
        new Date(lastBookingEndDate.getTime() + 6 * 24 * 60 * 60 * 1000)
      ) {
        dynamicPrice = dynamicPrice + 0.05 * dynamicPrice;
      } else if (
        checkInDate <=
        new Date(lastBookingEndDate.getTime() + 9 * 24 * 60 * 60 * 1000)
      ) {
        dynamicPrice = dynamicPrice + 0.1 * dynamicPrice;
      } else if (
        checkInDate <=
        new Date(lastBookingEndDate.getTime() + 12 * 24 * 60 * 60 * 1000)
      ) {
        dynamicPrice = dynamicPrice + 0.15 * dynamicPrice;
      } else if (
        checkInDate <=
        new Date(lastBookingEndDate.getTime() + 15 * 24 * 60 * 60 * 1000)
      ) {
        dynamicPrice = dynamicPrice + 0.2 * dynamicPrice;
      } else {
        return  "Cant Book property beyond 15 days" ;
      }
    }

   
    const returnData: DateWithPrice[] = [];

    const dateAfter3Months = new Date(checkInDate);
    dateAfter3Months.setMonth(dateAfter3Months.getMonth() + 3);    
    returnData.push({uptoDate:dateAfter3Months,price:dynamicPrice})

    const dateAfter5Months = new Date(checkInDate);
    dateAfter5Months.setMonth(dateAfter5Months.getMonth() + 5);    
    returnData.push({uptoDate:dateAfter5Months,price:0.95*dynamicPrice <property.totalPrice ?property.totalPrice : 0.95*dynamicPrice})


    const dateAfter9Months = new Date(checkInDate);
    dateAfter9Months.setMonth(dateAfter9Months.getMonth() + 9);
    
    returnData.push({uptoDate:dateAfter9Months,price:0.90*dynamicPrice <property.totalPrice ?property.totalPrice : 0.90*dynamicPrice})

    const dateAfter12Months = new Date(checkInDate);
    dateAfter12Months.setMonth(dateAfter12Months.getMonth() + 12);
    returnData.push({uptoDate:dateAfter12Months,price:0.85*dynamicPrice <property.totalPrice ?property.totalPrice : 0.85*dynamicPrice})
    
    const cantBookAfterGivenDate = new Date(checkInDate);
    // cantBookAfterGivenDate.setMonth(cantBookAfterGivenDate.getMonth()+property.minStay)
    cantBookAfterGivenDate.setDate(cantBookAfterGivenDate.getDate() + property.minStay);


    
    return {data:returnData,cantBookBefore:cantBookAfterGivenDate}

    


}
export const getPricing = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    let checkInDate: Date;
    if (typeof req.query.checkInDate == "string")  {
      checkInDate = new Date(req.query.checkInDate);
    }
    const result = await getPrice(id,checkInDate)
    if(typeof(result)!=="string")
    {
       return res.status(200).json(result)
    }
    else
    {
        return res.status(500).json({message:result})
    }

   
  } catch (error) {
    res.status(500).json({ message: "Error While Getting Pricing" });
  }
};

// export const getPrice=async(checkinDate:Date, checkOutDate:Date,dynamicPrice:number) =>{
//     try {
        
//     } catch (error) {
//         return "Error While Fetching"
//     }
// }
