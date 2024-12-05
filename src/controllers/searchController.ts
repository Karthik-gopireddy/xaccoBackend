import { Request, Response } from "express";
import { SearchTable } from "../models/search.Schema";
import { Op } from "sequelize";
import { sequelize } from "../db/sequelize";
import { Property } from "../models/property.Schema";
import { dateForWhichPropertyBooked } from "./propertyController";
import { BUFFER_DAY } from "../utils/Constants";

interface BookingAvailableDate {
  startDate: Date,
  endDate: Date
}
interface PropertyAvailabilityList {
  availbale: boolean,
  bookedDates: BookingAvailableDate[]
}


export const isPropertyAvailableInGivenDate = async (id: unknown, moveinDate: unknown, moveoutDate: unknown) => {
  try {
    const listOfDatePropertyBooked = await dateForWhichPropertyBooked(id);
    console.log("HErererrererewrerererere")
    if (listOfDatePropertyBooked == "Error While checking property") {
      return "Error While checking property";
    }
    if (listOfDatePropertyBooked.length !== 0) {
      if (typeof (moveinDate) == "string" && typeof (moveoutDate) == "string") {
        console.log("Hereerer")
        const startDate = new Date(moveinDate)
        const endDate = new Date(moveoutDate)
        for (const { startDate: bookedStartDate, endDate: bookedEndDate } of listOfDatePropertyBooked) {
          console.log("Herer2")
          if (startDate >= bookedStartDate && startDate <= bookedEndDate) {
            const resultCheck: PropertyAvailabilityList = {
              availbale: false,
              bookedDates: listOfDatePropertyBooked
            };

            return resultCheck;

          }

          if (endDate >= bookedStartDate && endDate <= bookedEndDate) {
            const resultCheck: PropertyAvailabilityList = {
              availbale: false,
              bookedDates: listOfDatePropertyBooked
            };
            return resultCheck;

          }

          if (startDate <= bookedStartDate && endDate >= bookedEndDate) {
            const resultCheck: PropertyAvailabilityList = {
              availbale: false,
              bookedDates: listOfDatePropertyBooked
            };
            return resultCheck;
          }
          const resultCheck: PropertyAvailabilityList = {
            availbale: true,
            bookedDates: []
          };
          return resultCheck;
        }

      }
      else {
        throw "Error";

      }
    }
    else {
      const resultCheck: PropertyAvailabilityList = {
        availbale: true,
        bookedDates: []
      };

      return resultCheck;
    }

  } catch (error) {

    console.log("Error while checking property availability:", error);

    let resultCheck: PropertyAvailabilityList;

    resultCheck.availbale = true

    return resultCheck;
  }
}

export const createSearchData = async (key: string, value: string) => {
  try {
    let searchData = await SearchTable.findOne({ where: { key: key } });

    if (searchData) {
      // If the key exists, increase the count by 1
      searchData.count += 1;
      await searchData.save();
      console.log("Count increased for existing key:", searchData);
    } else {
      // If the key doesn't exist, create a new record with count set to 1
      searchData = await SearchTable.create({
        key: key,
        value: value,
        count: 1,
      });
      console.log("New record created:", searchData);
    }
  } catch (error) {
    console.log("Error:", error);
  }
};

export const generateSuggestion = async (req: Request, res: Response) => {
  try {
    const searchText = req.query.searchText;
    const data = await SearchTable.findAll({
      where: {
        key: {
          [Op.iLike]: `${searchText}%`,
        },
      },
    });    
    res.status(200).json({ data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error while fetching search result" });
  }
};

export const getPropertyList = async (req: Request, res: Response) => {
  try {
    const result = [];
    // const availableProperty=[];
    const unAvailableProperty = []
    const { university, area, country, city, moveinDate, moveoutDate, guest, bed, bath, size, minMonth, minPrice, maxPrice } = req.query;
    if (university) {
      const query = `SELECT *
            FROM "Properties"
            WHERE "Properties"."universityAssociated" && (
                SELECT ARRAY[id] FROM "Universities"
                 WHERE "Universities".name =:uniName
                 and  "Universities".city=:cityName
                 and  "Universities".country=:countryName
                 
            );
            `;
      const properties = await sequelize.query(query, {
        replacements: {
          uniName: university,
          cityName: city,
          countryName: country,
        },
      });
      result.push(properties[0]);
      const query2 = `select "Properties".*
              from "Properties" 
              join "Cities" on "Properties".city="Cities".id
              where "Cities".name=:cityName
              and "Properties"."universityAssociated" not in (
                    SELECT ARRAY[id] FROM "Universities"
                               WHERE "Universities".name =:uniName
              )`;
      const propertiesByCity = await sequelize.query(query2, {
        replacements: {
          uniName: university,
          cityName: city
        },
      });
      propertiesByCity[0].map((item) => {
        result[0].push(item);

      })
    }
    else if (area) {
      const query = `select "Properties".*
            from "Properties" 
            join "Cities" on "Properties".city="Cities".id
            where "Properties".area=:areaName
            and "Cities".name=:cityName`;

      const propertiesWithinArea = await sequelize.query(query, {
        replacements: {
          areaName: area,
          cityName: city,
        },
      });
      result.push(propertiesWithinArea[0]);

      const query2 = `select "Properties".*
              from "Properties" 
              join "Cities" on "Properties".city="Cities".id
              where "Cities".name =:cityName
              and "Properties".area!=:areaName`;
      const propertiesWithinCity = await sequelize.query(query2, {
        replacements: {
          areaName: area,
          cityName: city,
        },
      });
      propertiesWithinCity[0].map((item) => {
        result[0].push(item);

      })

    }
    else if (city) {      
      const query = `select "Properties".*,"Cities"."currencyIcon","Cities"."currencyCode"
            from "Properties" 
            join "Cities" on "Properties".city="Cities".id
            where "Cities".name =:cityName`;
      const propertiesWithinCity = await sequelize.query(query, {
        replacements: {
          cityName: city,
        },
      });      
      result.push(propertiesWithinCity[0]);
    }
    else if (country) {      
      const query = `select "Properties".*
        from "Properties" where country=:country join "Cities" on "Properties".city="Cities".id`;
      const propertiesWithinCountry = await sequelize.query(query, {
        replacements: {
          country:country
        },
      }); 
      result.push(propertiesWithinCountry[0]);
    }
    else {
      const query = `select "Properties".*
        from "Properties"`;
      const propertiesWithinCity = await sequelize.query(query, {
        replacements: {
        },
      }); 
      result.push(propertiesWithinCity[0]);
    }
    if (bed) {
      const resultCheck = []
      result[0].map((item) => {
        if (item?.bedroom >= bed) {
          resultCheck.push(item)
        }
        else {
          unAvailableProperty.push(item)
        }
      })

      result[0] = resultCheck
    }
    if (bath) {
      const resultCheck = []
      result[0].map((item) => {
        if (item?.bath >= bath) {
          resultCheck.push(item)
        }
        else {
          unAvailableProperty.push(item)
        }
      })
      result[0] = resultCheck
    }
    if (size) {
      const resultCheck = []
      result[0].map((item) => {
        if (item?.size >= size) {
          resultCheck.push(item)
        }
        else {
          unAvailableProperty.push(item)
        }
      })
      result[0] = resultCheck
    }
    if (minMonth) {
      const resultCheck = []
      result[0].map((item) => {
        if (item?.minStay <= minMonth) {
          resultCheck.push(item)
        }
        else {
          unAvailableProperty.push(item)
        }
      })
      result[0] = resultCheck
    }
    if (minPrice) {
      const resultCheck = []
      result[0].map((item) => {
        if (item?.price >= minPrice) {
          resultCheck.push(item)
        }
        else {
          unAvailableProperty.push(item)
        }
      })
      result[0] = resultCheck
    }
    if (maxPrice) {
      const resultCheck = []
      result[0].map((item) => {
        if (item?.price <= maxPrice) {
          resultCheck.push(item)
        }
        else {
          unAvailableProperty.push(item)
        }
      })
      result[0] = resultCheck
    }
    if (guest) {
      const resultCheck = []
      result[0].map((item) => {
        if (item?.resident >= guest) {
          resultCheck.push(item)
        }
        else {
          unAvailableProperty.push(item)
        }
      })
      result[0] = resultCheck
    }

    await Promise.all(
      result[0].map(async (item, index) => {
        const bookedDates = await dateForWhichPropertyBooked(item?.id)
        if (bookedDates == "Error While checking property") {
          return "Error While checking property";
        }
        bookedDates.sort((a, b) => b.endDate.getTime() - a.endDate.getTime());

        let lastBookingEndDate =
          bookedDates.length > 0 ? bookedDates[0].endDate : null;


        if (lastBookingEndDate != null) {
          lastBookingEndDate = new Date(
            lastBookingEndDate.getTime() + BUFFER_DAY * 24 * 60 * 60 * 1000
          );
        } else {
          lastBookingEndDate = new Date();
        }
        
        result[0][index].availableFrom =lastBookingEndDate
      })
    )
    

    return res.status(200).json({ availableRoom: result[0] })



    // if(moveinDate && moveoutDate)
    // { 
    //   let startDate=new Date();
    //   let endDate= new Date();
    //   if(typeof(moveinDate) == 'string' && typeof(moveoutDate)=='string')
    //   {
    //     startDate= new Date(moveinDate)
    //     endDate= new Date(moveoutDate)
    //     if (new Date(moveinDate) >= new Date(moveoutDate)) {
    //       return res.status(400).json({ message: 'Move-in date must be before move-out date' });
    //     }

    //     const currentDate = new Date();
    //     if (new Date(moveinDate) < currentDate || new Date(moveoutDate) < currentDate) {
    //       return res.status(400).json({ message: 'Move-in date and move-out date cannot be in the past' });
    //     }
    //   }
    //   const available=[]
    //   const availableOnOtherDate=[]
    //   console.log(result[0].length,"Lengtj")
    //     // res.status(200).json({data:result})
    //     await Promise.all(
    //     result[0].map(async(item)=>{
    //        const propertieAvalability =await isPropertyAvailableInGivenDate(item?.id,moveinDate,moveoutDate);
    //        console.log(propertieAvalability,"Available")
    //        if(propertieAvalability =="Error While checking property")
    //        {
    //           throw "Error While checking property";
    //        }
    //        if(propertieAvalability?.availbale)
    //        {
    //         available.push(item)
    //        }
    //        else
    //        {
    //         // item.bookedDates = propertieAvalability?.bookedDates
    //         const bookedDates=[]
    //       propertieAvalability?.bookedDates.map((item)=>{
    //         if (startDate >= item.startDate && startDate <= item.endDate)
    //         {
    //           bookedDates.push(item)
    //         } 
    //         else if (endDate >= item.startDate && endDate <= item.endDate)
    //         {
    //           bookedDates.push(item)
    //         }
    //         else if(startDate <= item.startDate && endDate >= item.endDate)
    //         {
    //           bookedDates.push(item)
    //         }
    //       })

    //         availableOnOtherDate.push(bookedDates)
    //        }
    //     }))
    //     res.status(200).json({availableRoom:available,availableOnOtherDate:availableOnOtherDate})
    // }
    // else
    // {
    //   res.status(200).json({availableRoom:result[0]})

    // }


  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error While Finding Property" });
  }
};
