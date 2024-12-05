import { Request, Response } from "express";
import { Property } from "../models/property.Schema";
import { uploadSingleFile } from "../utils/s3-setup";
import { sequelize } from "../db/sequelize";
import { Booking } from "../models/booking.Schema";
import { createSearchData } from "./searchController";
import { City } from "../models/city.Schema";
import { University } from "../models/university.Schema";
import { RequestWithUser } from "./ratingController";
import { User } from "../models/users.Schema";
import { BUFFER_DAY } from "../utils/Constants"

interface BookingAvailableDate {
  startDate: Date,
  endDate: Date
}

interface PropertyWithBookings extends Property {
  ongoingBooking: Booking[]
  previousBooking: Booking[]
}

// export const dateForWhichPropertyBooked = async (id: unknown) => {
//   try {
//     const listOfDatePropertyIsBooked: BookingAvailableDate[] = [];
//     const booking = await Booking.findAll({
//       where: {
//         property: id,
//         status: ['booked', 'service_fee_paid']
//       }
//     });
//     console.log("booking",booking);

//     booking.forEach((item) => {
//       // console.log(item)
//       // console.log(item.moveOutData,"Move out date date")
//       const moveinDate = new Date(item.moveinDate);
//       const moveoutDate = new Date(item.moveOutData);
//       // console.log(moveoutDate,"Date Move Out")

//       console.log(moveinDate.setDate(moveinDate.getDate() - BUFFER_DAY));
//       moveoutDate.setDate(moveoutDate.getDate() + BUFFER_DAY);
//       // console.log(moveoutDate,"Date Move Out")

//       listOfDatePropertyIsBooked.push({
//         startDate: moveinDate,
//         endDate: moveoutDate
//       });
//     });

//     // console.log(listOfDatePropertyIsBooked, "List of Booked Dates");
//     return listOfDatePropertyIsBooked;
//   } catch (error) {
//     console.log("Error While checking property", error);
//     return "Error While checking property";
//   }
// }
export const dateForWhichPropertyBooked = async (id: unknown) => {
  try {
    const booking = await Booking.findAll({
      where: {
        property: id,
        status: ['booked', 'service_fee_paid'],
      },
    });

    if (!booking.length) {
      return []; // No bookings exist for the property
    }

    const listOfDatePropertyIsBooked: BookingAvailableDate[] = [];
    booking.forEach((item) => {
      const moveinDate = new Date(item.moveinDate);
      const moveoutDate = new Date(item.moveOutData);

      moveinDate.setDate(moveinDate.getDate() - BUFFER_DAY);
      moveoutDate.setDate(moveoutDate.getDate() + BUFFER_DAY);

      listOfDatePropertyIsBooked.push({
        startDate: moveinDate,
        endDate: moveoutDate,
      });
    });

    return listOfDatePropertyIsBooked;
  } catch (error) {
    console.log("Error While checking property", error);
    return "Error While checking property";
  }
};



// export const isPropertyAvailableInGivenDate = async (id: unknown, moveinDate: unknown, moveoutDate: unknown) => {
//   try {
//     const listOfDatePropertyBooked = await dateForWhichPropertyBooked(id);
//     console.log(listOfDatePropertyBooked)
//     if (listOfDatePropertyBooked == "Error While checking property") {
//       return "Error While checking property";
//     }
//     if (typeof (moveinDate) == "string" && typeof (moveoutDate) == "string") {
//       const startDate = new Date(moveinDate)
//       const endDate = new Date(moveoutDate)
//       for (const { startDate: bookedStartDate, endDate: bookedEndDate } of listOfDatePropertyBooked) {
//         if (startDate >= bookedStartDate && startDate <= bookedEndDate) {
//           return false;
//         }

//         if (endDate >= bookedStartDate && endDate <= bookedEndDate) {
//           return false;
//         }

//         if (startDate <= bookedStartDate && endDate >= bookedEndDate) {
//           return false;
//         }
//       }


//       return true;
//     }
//     else {
//       throw "Error";

//     }
//   } catch (error) {
//     console.log("Error while checking property availability:", error);
//     return false; // or handle the error as per your application's requirements
//   }
// }
export const isPropertyAvailableInGivenDate = async (id: unknown, moveinDate: unknown, moveoutDate: unknown) => {
  try {
    const listOfDatePropertyBooked = await dateForWhichPropertyBooked(id);

    if (listOfDatePropertyBooked === "Error While checking property") {
      return "Error While checking property";
    }

    if (listOfDatePropertyBooked.length === 0) {
      return true; // No bookings exist, property is available
    }

    const startDate = new Date(moveinDate as string);
    const endDate = new Date(moveoutDate as string);

    for (const { startDate: bookedStartDate, endDate: bookedEndDate } of listOfDatePropertyBooked) {
      if (
        (startDate >= bookedStartDate && startDate <= bookedEndDate) ||
        (endDate >= bookedStartDate && endDate <= bookedEndDate) ||
        (startDate <= bookedStartDate && endDate >= bookedEndDate)
      ) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.log("Error while checking property availability:", error);
    return false;
  }
};


export const createProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log(req.body)
    const image: string[] = [];
    const otherImages: { [fieldname: string]: string } = {};
    if (req.files) {
      const fieldname = "photos";

      if (fieldname in req.files) {
        const filesArray: Express.Multer.File[] = req.files[
          fieldname
        ] as Express.Multer.File[];

        if (filesArray && Array.isArray(filesArray)) {
          await Promise.all(
            filesArray.map(async (item) => {
              const img = await uploadSingleFile(item);
              image.push(img);
            })
          );
          // res.status(400);
        }
      }

      const otherFieldnames = ["floorPlan"];

      await Promise.all(
        otherFieldnames.map(async (fieldname) => {
          if (fieldname in req.files) {
            const filesArray: Express.Multer.File[] = req.files[
              fieldname
            ] as Express.Multer.File[];
            const img = await uploadSingleFile(filesArray[0]);
            otherImages[fieldname] = img;
            // console.log(img, "Image");
          }
        })
      );
    }   

    const property = await Property.create({
      photos: image,
      name: req.body.name,
      type: req.body.type,
      buildingType: req.body.buildingType,
      totalPrice: req.body.totalPrice,
      priceBreakup: req.body.priceBreakup ? JSON.parse(req.body.priceBreakup) : [], // Parse priceBreakup
      bedroom: parseInt(req.body.bedroom),
      bath: parseInt(req.body.bath),
      resident: parseInt(req.body.resident),
      size: parseInt(req.body.size),
      minStay: parseInt(req.body.minStay) || 0,
      price: parseInt(req.body.price),
      ameinties: req.body.ameinties ? JSON.parse(req.body.ameinties) : [], // Parse amenities
      aroundTown: req.body.aroundTown,
      city: req.body.city,
      country: req.body.country,
      area: req.body.area,
      locationDescription: req.body.locationDescription,
      threeTour: req.body.threeTour || null,
      floorPlan: otherImages["floorPlan"] || null,
      ttkMessage: req.body.ttkMessage || null,
      ttkVideo: req.body.ttkVideo || null,
      universityAssociated: req.body.universityAssociated ? JSON.parse(req.body.universityAssociated) : null, // Parse universityAssociated
      status: req.body.status || "available",
      serviceFee: req.body.serviceFee || null,
      longitude: req.body.longitude,
      latitude: req.body.latitude,
      maxmDaysToBookProperty: req.body.maxmDaysToBookProperty,
      priceInc: req.body.priceInc ? JSON.parse(req.body.priceInc) : [], // Parse priceInc
      aboutProperty: req.body.aboutProperty,
      extraTopicHeading: req.body.extraTopicHeading,
      extraTopicDetails: req.body.extraTopicDetails,
      repairUpto: req.body.repairUpto,
      accountHolderName: req.body.accountHolderName,
      accountHolderBank: req.body.accountHolderBank,
      accountNumber: req.body.accountNumber,
  });
  
    console.log(property,"property")
    const city = await City.findByPk(property.city)
    await createSearchData(`${property.area} , ${city.name} , ${city.country}`, `area=${property.area}&city=${city.name}&country=${city.country}`)

    res.status(200).json({ data: property });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

export const getPropertyById = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.query;
    let sqlQuery = `
      SELECT "Property".*
      FROM "Properties" AS "Property"
        WHERE "Property"."id" = :id 
  `;

    sqlQuery += ` GROUP BY "Property"."id"`;
    const properties = await sequelize.query(sqlQuery, {
      replacements: {
        id: id,
      },
    }) as Property[];

    if (!properties) {
      res.status(404).json({ message: "No properties found" });
      return;
    }
    if (req?.user?.user?.id) {

      const user = await User.findOne({
        where: { id: req.user.user.id },
        attributes: ['wishList']
      });
      if (user.wishList.includes(properties[0][0].id)) {
        properties[0][0].isWish = true
      }
      else {
        properties[0][0].isWish = false

      }



    }
    const bookedDates = await dateForWhichPropertyBooked(properties[0][0]?.id)
    if (bookedDates == "Error While checking property") {
      // return "Error While checking property";
    }
    else {
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

      properties[0][0].availableFrom = lastBookingEndDate

    }




    // console.log(properties[0][0]?.city,"  Properties  ",properties[0][0]?.universityAssociated)
    const city = await City.findByPk(properties[0][0]?.city)
    const universityData = []
    await Promise.all(
      properties[0][0]?.universityAssociated?.map(async (item) => {
        universityData.push(await University.findByPk(item))
      })
    )

    properties[0][0].city = city
    properties[0][0].universityAssociated = universityData


    res.status(200).json({ data: properties[0][0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProperty = async (req: Request, res: Response) => {
  try {
    const { id, city } = req.query;
    if (id) {
      const ProprtyData = await Property.findOne({
        where: { id: id }
      });

      res.status(200).json({ data: ProprtyData })
    }
    else if (city) {
      const query = `
    SELECT "Properties".*
    FROM "Properties"
    JOIN "Cities" ON "Properties".city = "Cities".id
    WHERE ("Cities".name = :cityName OR "Cities".id = :cityName)
    AND "Properties".status NOT IN ('disable')
    ORDER BY "Properties"."createdAt" DESC
`;


      const propertiesWithinCity = await sequelize.query(query, {
        replacements: {
          cityName: city,
        },
      });

      res.status(200).json({ data: propertiesWithinCity[0] })
    }
    else {
      const propertyQuerry = `
    SELECT P.*, C.name AS cityName
    FROM "Properties" AS P
    JOIN "Cities" AS C ON P.city = C.id
    ORDER BY P."createdAt" DESC
`;

      const propertyResult = await sequelize.query(propertyQuerry, {
        replacements: {
        },
      });
      // const ProprtyData = await Property.findAll()
      res.status(200).json({ data: propertyResult[0] })

    }
  } catch (error) {
    res.status(500).json({ message: error })
  }
}

export const updateProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.query;

    // Retrieve only the fields that are present in the request body
    const updateFields: { [key: string]: unknown } = {};
    const parametersToCheck = [
      "name",
      "type",
      "buildingType",
      "bedroom",
      "bath",
      "resident",
      "size",
      "minStay",
      "price",
      "ameinties",
      "city",
      "country",
      "area",
      "locationDescription",
      "areaMapLink",
      "exactMapLink",
      "ttkMessage",
      "universityAssociated",
      "status",
      "longitude",
      "latitude",
      "serviceFee",
      "mapCordinates",
      "maxmDaysToBookProperty",
      "priceInc",
      "threeTour",
      "ttkVideo",
      "extraTopicHeading",
      "extraTopicDetails",
      "repairUpto",
      "accountHolderName",
      "accountHolderBank",
      "accountNumber",
    ];


    parametersToCheck.forEach((parameter) => {
      if (req.body[parameter]) {
        // If the parameter is present in req.body, add it to the updateFields object
        updateFields[parameter] =
          parameter === "ameinties" || parameter === "universityAssociated" || parameter == "priceInc"
            ? JSON.parse(req.body[parameter])
            : req.body[parameter];
      }
    });

    if (req.files) {
      const fieldname = "photos";

      if (fieldname in req.files) {
        const filesArray: Express.Multer.File[] = req.files[
          fieldname
        ] as Express.Multer.File[];

        if (filesArray && Array.isArray(filesArray)) {
          const image = await Promise.all(
            filesArray.map(async (item) => {
              return uploadSingleFile(item);
            })
          );

          updateFields.photos = image;
        }
      }

      const otherFieldnames = ["floorPlan"];

      await Promise.all(
        otherFieldnames.map(async (fieldname) => {
          if (fieldname in req.files) {
            const filesArray: Express.Multer.File[] = req.files[
              fieldname
            ] as Express.Multer.File[];
            const img = await uploadSingleFile(filesArray[0]);
            updateFields[fieldname] = img;
            // console.log(img, "Image");
          }
        })
      );
    }

    const [numOfRowsUpdated, updatedProperties] = await Property.update(
      updateFields,
      {
        where: { id: id },
        returning: true,
      }
    );

    if (numOfRowsUpdated > 0) {
      res
        .status(200)
        .json({ message: "Update successful", data: updatedProperties[0] });
    } else {
      res.status(404).json({ message: "Property not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

export const deleteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.query;
    const deletedProperty = await Property.destroy({ where: { id: id } });
    if (!deletedProperty) {
      res.status(403).json({ message: "Property Not Found" });
    } else {
      res.status(200).json({ message: "Property Deleted Successfully" });
    }
  } catch (error) {
    res.status(503).json({ message: error });
  }
};

export const availableProperty = async (req: Request, res: Response) => {
  const book = await isPropertyAvailableInGivenDate(req?.query?.id, req.query.moveinDate, req.query.moveoutDate)
  res.status(200).json({ message: book })
}

//Handling Property Cart
export const addPropertyToWishlist = async (req: RequestWithUser, res: Response) => {
  try {
    const { propertyId } = req.body;
    const user = await User.findOne({
      where: { id: req.user.user.id }
    });
    const property = await Property.findOne({
      where: { id: req.body.propertyId }
    });
    // console.log(property,"Property")
    if (!property) {
      return res.status(403).json({ message: 'Property Doesnt exist' })
    }
    // console.log(user.wishList,"USer")
    const wishList = user.wishList;
    if (wishList.includes(propertyId)) {
      return res.status(403).json({ message: 'Property Already exist in wishlist' })

    }
    wishList.push(req.body.propertyId)
    // console.log(wishList,"lsit")
    await User.update({
      wishList: wishList
    }, {
      where: { id: req.user.user.id }
    });

    res.status(200).json({ message: 'Property added to wishlist successfully' });

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error })
  }
}

export const removePropertyFromWishlist = async (req: RequestWithUser, res: Response) => {
  try {
    const { propertyId } = req.body;
    const userId = req.user.user.id;

    const user = await User.findByPk(userId);
    // if(user.wishList.includes(propertyId))
    // {
    //   return res.status(403).json({message:"Property doesnt exist in wishlist"})
    // }

    const index = user.wishList.indexOf(propertyId);

    if (index === -1) {
      return res.status(404).json({ message: 'Property not found in wishlist' });
    }
    const wishList = user.wishList;
    // console.log(index,"Index")
    // user.wishList.
    wishList.splice(index, 1);

    await User.update({
      wishList: wishList
    }, {
      where: { id: req.user.user.id }
    })

    res.status(200).json({ message: 'Property removed from wishlist successfully' });
  } catch (error) {
    console.error('Error removing property from wishlist:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const wishListProperty = async (req: RequestWithUser, res: Response) => {

  try {
    const querry = 'Select p.id,p.name,bedroom,bath,photos,area,country FROM "Properties" p JOIN "Users" u ON p.id = ANY("wishList") WHERE u.id = :id;'
    const properties = await sequelize.query(querry, {
      replacements: {
        id: req.user.user.id,
      },
    }) as Property[];
    res.status(200).json({ data: properties[0] })
  } catch (error) {
    console.log(error, "Error")
    res.status(500).json({ error: "Error While fetching wishlist data" })
  }

}

export const adminGetProperty = async (req: Request, res: Response) => {
  try {
    const propertyQuerry = `select * from "Properties"`
    const properties = await sequelize.query(propertyQuerry, {
      replacements: {
      },
    }) as PropertyWithBookings[][];


    await Promise.all(
      properties[0].map(async (item, index) => {
        const ongoingBookingQuerry = `select * from "Bookings" 
          where "Bookings".property=:propId and 
          "Bookings".status  in ('loi_signed','service_fee_paid')`
        const ongoinBooking = await sequelize.query(ongoingBookingQuerry, {
          replacements: {
            propId: item.id
          },
        }) as Booking[][];
        properties[0][index].ongoingBooking = ongoinBooking[0]

        const pastBookingQuerry = `select * from "Bookings" 
          where "Bookings".property=:propId and 
          "Bookings".status  in ('booked')`
        const pastBooking = await sequelize.query(pastBookingQuerry, {
          replacements: {
            propId: item.id
          },
        }) as Booking[][];
        properties[0][index].previousBooking = pastBooking[0]
      })


    )
    res.status(200).json({ data: properties[0] })
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error While Fetching Property' })
  }
}


