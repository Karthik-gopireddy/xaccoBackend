import { Request, Response } from "express";
import { Booking } from "../models/booking.Schema";
import { Property } from "../models/property.Schema";
import { City } from "../models/city.Schema";
import { Tenant } from "../models/tenant.Schema";
import { Documents } from "../models/document.Schema";
import { uploadSingleFile } from "../utils/s3-setup";
import { sequelize } from "../db/sequelize";
import { LOI } from "../models/loi.Schema";
import { isPropertyAvailableInGivenDate } from "./propertyController";
import { getPrice } from "./priceController";
import { Payment } from "../models/payment.Schema";
import { sendEmail } from "./users.Controller";
import requestIP from 'request-ip';
import { RequestWithUser } from "./ratingController";
import { User } from "../models/users.Schema";
import { error } from "console";
import { Contract } from "../models/contract.Schema";
import { pdfGenrator } from "../utils/creteLOI";
import { Op, where } from "sequelize";
import { singaporeContractGenerator } from "../utils/createSingaporeContract";

import { createClient } from 'redis';
import { Replacement } from "../models/replacement.Schema";

const redisClient = createClient({
  url: 'redis://localhost:6379', // adjust this URL based on your Redis setup
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
  await redisClient.connect();
})();
interface QueryResult {
  documentNeeded: string; // Adjust the type accordingly
}

interface userRequest extends Request {
  user: {
    user: {
      email: string;
      id: string;
    };
  };
}

interface Tenant_with_doc {
  id: string;
  email: string;
  passport: string;
  documentStatus: string;
  documents: string[];
  name: string;
  reason: string;
  loiUploaded: boolean;
}

interface BookingWithDetails extends Booking {
  tenants_Detals: Tenant_with_doc[];
  propertyDetails: Property;
}

interface BookingWithProperty {
  tenants: [];
  name: string;
  area: string;
  country: string;

}

// Booking Get Apis


export const singleBooking = async (req: userRequest, res: Response) => {
  try {

    if (!req.query.booking) {
      return res.status(403).json({ error: "Booking Id Not Found" })
    }

    const bookingQuery = `select * from "Bookings" where "Bookings".id=:id`
    const bookResult = await sequelize.query(bookingQuery, {
      replacements: {
        id: req.query.booking
      }
    }) as BookingWithDetails[][];
    const propertyQuery = `select * from "Properties" where "Properties".id=:id`
    const propertyResult = await sequelize.query(propertyQuery, {
      replacements: {
        id: bookResult[0][0].property
      }
    }) as Property[][];

    const cityQuery = `select * from "Cities" where "Cities".id = :id`
    const cityResult = await sequelize.query(cityQuery, {
      replacements: {
        id: propertyResult[0][0].city
      }
    }) as City[][];

    if (bookResult[0].length == 0) {
      return res.status(403).json({ message: 'Booking not found' })
    }

    bookResult[0][0].propertyDetails = propertyResult[0][0]


    if (bookResult[0][0].tenants.length !== 0) {
      const tenantsQuerry = `SELECT * FROM "Tenants" WHERE "Tenants".id IN (:tenants) AND "Tenants".active = true`;
      const tenantResult = await sequelize.query(tenantsQuerry, {
        replacements: {
          tenants: bookResult[0][0].tenants
        }
      }) as Tenant_with_doc[][];
      bookResult[0][0].tenants_Detals = tenantResult[0];

    }
    else {
      bookResult[0][0].tenants_Detals = [];
    }


    res.status(200).json({ data: bookResult[0], cityData: cityResult[0][0] })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error })
  }
}
export const getSingleBooking = async (req: userRequest, res: Response) => {
  try {
    const bookingquery = `select
                          *
                        from
                          "Bookings"
                        where
                         ( "Bookings" .id  in( select booking from "Tenants" where "Tenants".email =:email AND "Tenants".active != false)
                          or 
                          "Bookings"."bookedBy" = :userId
                          )
                          ORDER BY "Bookings"."updatedAt" DESC
                          ;`;
    const result = (await sequelize.query(bookingquery, {
      replacements: {
        email: req.user.user.email,
        userId: req.user.user.id
      },
    })) as BookingWithDetails[][];

    await Promise.all(
      result[0].map(async (item, index) => {
        const tenantsDetails: Tenant_with_doc[] = [];
        const property = await Property.findByPk(item.property);
        result[0][index].propertyDetails = property
        await Promise.all(
          item.tenants.map(async (tenant) => {
            const tenant_details = await Tenant.findByPk(tenant);
            const tenants_documents = await Documents.findAll({
              where: { tentantsId: tenant },
            });
            const documentList: string[] = [];
            tenants_documents.map((doc) => {
              documentList.push(doc.dataValues?.documentName);
            });
            tenantsDetails.push({
              id: tenant_details?.dataValues?.id,
              email: tenant_details?.dataValues?.email,
              passport: tenant_details?.dataValues?.passport,
              documentStatus: tenant_details?.dataValues?.documentStatus,
              documents: documentList,
              name: tenant_details?.dataValues?.name,
              reason: tenant_details?.dataValues?.reason,
              loiUploaded: tenant_details?.loiUploaded
            });
          })
        );
        result[0][index].tenants_Detals = tenantsDetails;
      })
    );
    const { booking } = req.query
    if (booking) {
      result[0] = result[0].filter((item) => item.id == booking)
    }

    res.status(200).json({ data: result[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};
export const pastBooking = async (req: userRequest, res: Response) => {
  try {
    const bookingquery = `select
                          *
                        from
                          "Bookings"
                        where
                          exists (
                            select
                              1
                            from
                              "Tenants"
                            where
                            cast( "Tenants".id as varchar) = any ("Bookings".tenants)
                              and "Tenants".email = :email
                          )
                          and
                          "Bookings".status in ('completed','booked')
                          ;`;
    const result = (await sequelize.query(bookingquery, {
      replacements: { email: req.user.user.email },
    })) as BookingWithDetails[][];
    await Promise.all(
      result[0].map(async (item, index) => {
        const tenantsDetails: Tenant_with_doc[] = [];

        await Promise.all(
          item.tenants.map(async (tenant) => {
            const tenant_details = await Tenant.findByPk(tenant);
            const tenants_documents = await Documents.findAll({
              where: { tentantsId: tenant },
            });
            const documentList: string[] = [];
            tenants_documents.map((doc) => {
              documentList.push(doc.dataValues?.documentName);
            });
            tenantsDetails.push({
              id: tenant_details?.dataValues?.id,
              email: tenant_details?.dataValues?.email,
              passport: tenant_details?.dataValues?.passport,
              documentStatus: tenant_details?.dataValues?.documentStatus,
              documents: documentList,
              name: tenant_details?.dataValues?.name,
              reason: tenant_details?.dataValues?.reason,
              loiUploaded: tenant_details?.dataValues?.loiUploaded
            });
          })
        );
        result[0][index].tenants_Detals = tenantsDetails;
      })
    );

    const { booking } = req.query
    if (booking) {
      result[0] = result[0].filter((item) => item.id == booking)
    }

    res.status(200).json({ data: result[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

// export const initialBooking = async (req: userRequest, res: Response) => {
    
//   try {
//     console.log(req.body.moveInDate)
//     console.log(new Date())
//     const startDate = new Date(req.body.moveInDate)
//     const endDate = new Date(req.body.moveOutDate)
//     if (startDate > endDate) {
//       return res.status(400).json({ message: 'Check Out Date Can not be before Check In Date' })
//     }
//     if (startDate > new Date() || endDate < new Date()) {
//       return res.status(400).json({ message: 'Check Out Date  or Check in date can not be in past' })

//     }

//     const pro = await Property.findOne({
//       where: { id: req.body.property },
//       attributes: ["price", "serviceFee", "city"],
//     });




//     const documentNeeded = `select "documentNeeded" from "Cities" join "Properties" on "Properties".city="Cities".id
//     where "Properties".id = :propertyId
//                           ;`;
//     const result = (await sequelize.query(documentNeeded, {
//       replacements: { propertyId: req.body.property },
//     })) as City[];
//     const dataRoomAvailable = await isPropertyAvailableInGivenDate(
//       req.body.property,
//       req.body.moveInDate,
//       req.body.moveOutDate
//     );
//     const getPriceData = await getPrice(req.body.property, startDate)
//     let monthlyRent = pro.price;
//     if (typeof (getPriceData) !== 'string') {
//       if (endDate < getPriceData.cantBookBefore) {
//         return res.status(500).json({ message: "Duration Too short" })
//       }
//       else {
//         for (let i = 0; i < getPriceData.data.length; i++) {

//           const item = getPriceData.data[i];

//           if (endDate <= item.uptoDate) {
//             monthlyRent = item.price;
//             break;
//           }
//         }
//       }
//     }
//     else {
//       return res.status(500).json({ message: getPriceData })
//     }
//     if (!dataRoomAvailable) {
//       res
//         .status(403)
//         .json({ message: "Property Not Avialable for booking in given date" });
//     } else {
//       const booking = await Booking.create({
//         type: req.body.type,
//         status: "tenant_details",
//         property: req.body.property,
//         city: pro.city,
//         moveinDate: req.body.moveInDate,
//         monthlyRent: monthlyRent,
//         serviceFee: pro.serviceFee,
//         moveOutData: req.body.moveOutDate,
//         tenants: [],
//         totaltenants: req.body.totaltenants,
//         bookedBy: req.user.user.id,
//         bookedByEmail: req.user.user.email
//       });
//       const tenants: string[] = [];
//       const tenantsDetails: Tenant[] = [];

//       const user = await User.findOne({
//         where: { id: req.user.user.id }
//       })

//       const tenant = [
//         {
//           name: user.name,
//           email: user.email,
//         }
//       ]
//       await Promise.all(
//         tenant.map(async (item) => {
//           const user = await Tenant.create({
//             name: item.name,
//             email: item.email,
//             passport: "",
//             booking: booking.id,
//             reason: null,
//             active: 1,
//             loiUploaded: false,
//             documentList: []
//           });
//           tenants.push(user.id);
//           tenantsDetails.push(user)
//         })
//       );
//       await Booking.update(
//         {
//           tenants: tenants,
//         },
//         {
//           where: { id: booking.id },
//         }
//       );

//       booking.tenants = tenants;
//       res.status(201).json({ data: booking, tenantsDetails: tenantsDetails, documentNeeded: result[0][0]?.documentNeeded });
//     }
//   } catch (error) {
//     console.log(error);
//     // dlfkj
//     return res.status(500).json({ message: error });
//   }
// };


export const initialBooking = async (req: userRequest, res: Response) => {
  try {
    console.log(req.body.moveInDate);
    console.log(new Date());

    const startDate = new Date(req.body.moveInDate);
    const endDate = new Date(req.body.moveOutDate);

    // Validation for date ranges
    if (startDate > endDate) {
      return res.status(400).json({ message: 'Check Out Date cannot be before Check In Date' });
    }
    // if (startDate < new Date() || endDate >= new Date()) {
    //   return res.status(400).json({ message: 'Check In Date or Check Out Date cannot be in the past' });
    // }

    // Fetch property details
    const pro = await Property.findOne({
      where: { id: req.body.property },
      attributes: ["price", "serviceFee", "city"],
    });
   

    if (!pro) {
      return res.status(404).json({ message: "Property not found. Please add a property to the database." });
    }

    // Fetch document requirements
    const documentNeeded = `select "documentNeeded" from "Cities" join "Properties" on "Properties".city="Cities".id
    where "Properties".id = :propertyId;`;
    const result = (await sequelize.query(documentNeeded, {
      replacements: { propertyId: req.body.property },
    })) as City[];


    if (!result[0]?.length) {
      return res.status(404).json({ message: "No document requirements found for the specified city." });
    }

    // Check property availability for given dates
    // const dataRoomAvailable = await isPropertyAvailableInGivenDate(
    //   req.body.property,
    //   req.body.moveInDate,
    //   req.body.moveOutDate
    // );

    // if (!dataRoomAvailable) {
    //   return res.status(403).json({ message: "Property not available for booking on the given dates." });
    // }

    // Fetch pricing details
    let monthlyRent = pro.price;
    
    // const getPriceData = await getPrice(req.body.property, startDate);
    // let monthlyRent = pro.price;
    // console.log(getPriceData)

    // if (typeof getPriceData !== 'string') {
    //   if (endDate < getPriceData.cantBookBefore) {
    //     return res.status(500).json({ message: "Duration too short for booking." });
    //   } else {
    //     for (let i = 0; i < getPriceData.data.length; i++) {
    //       const item = getPriceData.data[i];
    //       if (endDate <= item.uptoDate) {
    //         monthlyRent = item.price;
    //         break;
    //       }
    //     }
    //   }
    // } else {
    //   return res.status(500).json({ message: getPriceData });
    // }

    // Create a booking entry
    const booking = await Booking.create({
      type: req.body.type,
      status: "tenant_details",
      property: req.body.property,
      city: pro.city,
      moveinDate: req.body.moveInDate,
      monthlyRent: monthlyRent,
      serviceFee: pro.serviceFee,
      moveOutData: req.body.moveOutDate,
      tenants: [],
      totaltenants: req.body.totaltenants,
      bookedBy: req.user.user.id,
      bookedByEmail: req.user.user.email,
    });

    // Create tenant details
    const user = await User.findOne({ where: { id: req.user.user.id } });
    if (!user) {
      return res.status(404).json({ message: "User not found. Cannot proceed with booking." });
    }

    const tenantDetails: Tenant[] = [];
    const tenant = [
      {
        name: user.name,
        email: user.email,
      },
    ];

    await Promise.all(
      tenant.map(async (item) => {
        const createdTenant = await Tenant.create({
          name: item.name,
          email: item.email,
          passport: "",
          booking: booking.id,
          reason: null,
          active: 1,
          loiUploaded: false,
          documentList: [],
        });
        tenantDetails.push(createdTenant);
      })
    );

    await Booking.update(
      { tenants: tenantDetails.map((tenant) => tenant.id) },
      { where: { id: booking.id } }
    );

    booking.tenants = tenantDetails.map((tenant) => tenant.id);

    res.status(201).json({
      data: booking,
      tenantsDetails: tenantDetails,
      documentNeeded: result[0][0]?.documentNeeded,
    });
  } catch (error) {
    console.log("Error in initialBooking:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};


export const addTenents = async (req: Request, res: Response) => {
    console.log(req.body)
  try {
    const { name, email, passport, reason } = req.body
    if (!name || name == '' || !email || email == '' || !passport || passport == '' || !reason || reason == 'select') {
      return res.status(403).json({ error: 'Please check all the input' })
    }
    const booking = await Booking.findByPk(req.body.booking);
    if (!booking) {
      res.status(403).json({ message: "Booking doesnt exist" });
    } else {
      const isRoomAvailable = await isPropertyAvailableInGivenDate(
        booking.property,
        booking.moveinDate,
        booking.moveOutData
      );
      if (!isRoomAvailable) {
        res
          .status(403)
          .json({
            message: "Property Not Avialable for booking in given date",
          });
      } else {
        const tenant = await Tenant.create({
          booking: req.body.booking,
          name: req.body.name,
          email: req.body.email,
          active: 1,
          passport: req.body.passport,
          reason: req.body.reason
        });
        await booking.update({
          tenants: [...booking.tenants, tenant.id],
          status: "tenant_details",
        });

        res.status(201).json({ data: tenant });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
export const editTenants = async (req: Request, res: Response) => {
  try {
    const { tenantId, email, name, passport, reason } = req.body
    const tenant = await Tenant.findByPk(tenantId)
    if (!tenant) {
      return res.status(403).json({ error: 'Tenanant does not found' })
    }
    await tenant.update({
      email: email ? email : tenant.email,
      name: name ? name : tenant.name,
      passport: passport ? passport : tenant.passport,
      reason: reason ? reason : tenant.reason
    })
    res.status(201).json({ data: tenant });

  } catch (error) {
    res.status(500).json({ message: 'Error while editing data' })
  }
}

export const addDocument = async (req: Request, res: Response) => {
  try {
    let doc = "";
    if (req.file) {
      doc = await uploadSingleFile(req.file);
    } else {
      return res.status(403).json({ message: "Document Not Found" });
    }    

    const booking = await Booking.findByPk(req.body.booking);
    const isRoomAvailable = await isPropertyAvailableInGivenDate(
      booking.property,
      booking.moveinDate,
      booking.moveOutData
    );
    if (!isRoomAvailable) {
      res.status(403).json({ message: "Property is booked for given date" });
    } else {
      const [document, created] = await Documents.findOrCreate({
        where: {
          tentantsId: req.body.tenantsId,
          booking: req.body.booking,
          documentName: req.body.name,
        },
        defaults: {
          document: doc,
        },
      });

      if (!created) {
        await document.update({
          documentName: req.body.name,
          document: doc,
        });
      }


      const list_of_document_uploaded = await Documents.findAll({
        attributes: ["documentName"],
        where: {
          tentantsId: req.body.tenantsId,
        },
      });
      const uploaded_doc = [];
      list_of_document_uploaded.forEach((item) => {
        uploaded_doc.push(item.documentName);
      });

      const query = `
                select
                "documentNeeded"
            from
                "Cities"
                join "Properties" on cast("Properties".city as uuid) = "Cities".id
                join "Bookings" on cast("Bookings".property as uuid) = "Properties".id
            where
                "Bookings".id = :bookingId
            `;

      const result = (await sequelize.query(query, {
        replacements: { bookingId: req.body.booking },
      })) as QueryResult[];

      if (!result) {
        return res
          .status(404)
          .json({ message: "No data found for the provided booking ID" });
      }

      const documentNeeded = result[0][0]?.documentNeeded;
      const neededDocument = [];
      documentNeeded.map((item) => {
        neededDocument.push(item?.name);
      });
      const status = neededDocument.every((document) =>
        uploaded_doc.includes(document)
      );
      if (status) {
        await Tenant.update(
          { documentStatus: "completed" },
          { where: { id: req.body.tenantsId } }
        );

        const tentants = await Tenant.findAll({
          attributes: ["documentStatus"],
          where: { booking: req.body.booking },
        });
        const is_every_document_uploaded = tentants.every(
          (item) => item.documentStatus === "completed"
        );        
        if (is_every_document_uploaded) {
          await Booking.update(
            {
              status: "document_uploaded",
            },
            { where: { id: req.body.booking } }
          );
        }
      }
      const tenant = await Tenant.findByPk(req.body.tenantsId);
      const tenantDocList = tenant.documentList || [];
      if (tenantDocList.includes(req.body.name)) {
        //nothing to do
      }
      else {
        tenantDocList.push(req.body.name)
      }
      await Tenant.update({
        documentList: tenantDocList
      },
        {
          where: {
            id: req.body.tenantsId
          }
        }
      )
      const tenantsDetails = await Tenant.findByPk(req.body.tenantsId);
      const bookingDetails = await Booking.findByPk(req.body.booking);


      res.status(200).json({ data: document, tenantsDetails: tenantsDetails, bookingDetails: bookingDetails });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};


//redis
export const sendReminder = async (req: Request, res: Response) => {
  try {
    const tenantMail = req.query.tenantMail as string;

    if (!tenantMail) {
      return res.status(400).json({ error: true, message: 'tenantMail query parameter is required' });
    }

    // Check the last sent time from Redis
    const lastSent = await redisClient.get(tenantMail);

    if (lastSent) {
      const lastSentTime = new Date(parseInt(lastSent));
      const currentTime = new Date();

      // Calculate the time difference in hours
      const timeDiff = (currentTime.getTime() - lastSentTime.getTime()) / (1000 * 60 * 60);

      if (timeDiff < 24) {
        return res.status(429).json({ error: true, message: 'Reminder already sent within the last 24 hours' });
      }
    }

    // Send the email
    await sendEmail(tenantMail, "Document Request", "Please upload your document ASAP, then only we will move forward. Otherwise, we will not proceed.", '');

    // Store the current time as the last sent time in Redis
    await redisClient.set(tenantMail, Date.now().toString());

    res.status(200).json({ error: false, email: "send" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: 'Internal Server Error' });
  }
};









export const uploadLoi = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.body.booking },
    });

    const isPropertyAvailable = await isPropertyAvailableInGivenDate(
      booking.property,
      booking.moveinDate,
      booking.moveOutData
    );
    if (!isPropertyAvailable) {
      res
        .status(403)
        .json({ message: "Property not available to be booked in given date" });
    }
    else {
      if (booking.status == "tenant_details") {
        res.status(428).json({ meesage: "Please Upload Documents First" });
      } else {
        let loiData = req.body.loi;

        const ipAddress = requestIP.getClientIp(req);
        let loi = await LOI.create({

          bookingId: req.body.booking,
          tenantsId: req.body.tenants,
          loi: loiData,
          ipAddress: ipAddress

        });
        await Tenant.update(
          { loiUploaded: true },
          { where: { id: req.body.tenants } }
        );



        let tenantDetails = await Tenant.findAll({
          where: { booking: req.body.booking, loiUploaded: false }
        })
        if (tenantDetails.length == 0) {
          await booking.update({
            status: 'loi_signed'
          })
        }
        tenantDetails = await Tenant.findAll({
          where: { booking: req.body.booking }
        })

        const dataForPdf = {}
        const property = await Property.findByPk(booking.property)
        dataForPdf['details'] = property.area, property.country

        var months;
        var date1 = new Date(booking.moveinDate);
        var date2 = new Date(booking.moveOutData);
        months = (date2.getFullYear() - date1.getFullYear()) * 12;
        months -= date1.getMonth() + 1;
        months += date2.getMonth();
        months = months <= 0 ? 0 : months;

        const tenant = await Tenant.findByPk(req.body.tenants)

        dataForPdf['details'] = property.name + ',' + property.area + ',' + property.country
        dataForPdf['month'] = months
        dataForPdf['monthlyRent'] = booking.monthlyRent
        dataForPdf['startDate'] = booking.moveinDate
        dataForPdf['tenantName'] = tenant.name
        dataForPdf['tenantPassport'] = tenant.passport
        dataForPdf['signedDate'] = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`
        dataForPdf['ipAddress'] = ipAddress
        dataForPdf['extraTopicHeading'] = property.extraTopicHeading
        dataForPdf['extraTopicDetails'] = property.extraTopicDetails
        dataForPdf['accountHolderName'] = property.accountHolderName
        dataForPdf['bankName'] = property.accountHolderBank
        dataForPdf['accountNumber'] = property.accountNumber
        dataForPdf['otherTenant'] = await Tenant.findAll({
          where: {
            booking: req.body.booking,
          }
        });
        const pdfUrl = await pdfGenrator(dataForPdf)
        await LOI.update({
          loi: pdfUrl
        },
          { where: { id: loi.id } }
        )

        await Tenant.update({
          loi: pdfUrl
        },
          {
            where: { id: req.body.tenants }
          })
        tenantDetails = await Tenant.findAll({
          where: { booking: req.body.booking }
        })

        const book = await Booking.findByPk(booking.id)
        res.status(201).json({ data: loi, booking: book, tenant_details: tenantDetails });
      }
    }
  } catch (error) {
    console.log("Error", error)
    res.status(500).json({ message: error });
  }
};
export const uploadLoiForReplacement = async (req: Request, res: Response) => {
  try {
    if( !req.body.replacementId || !req.body.loi){
      return res
      .status(403)
      .json({ message: "please check the payload" });
    }
    const replacement = await Replacement.findByPk(req.body.replacementId)    
    console.log(replacement,11111)
    const tenantData = await Tenant.findOne({where:{
      email:replacement?.email,
      booking:replacement?.booking,
    }})
    console.log(tenantData,333333)
    const booking = await Booking.findOne({
      where: { id: replacement.booking },
    });

    const isPropertyAvailable = await isPropertyAvailableInGivenDate(
      booking.property,
      booking.moveinDate,
      booking.moveOutData
    );
    if (!isPropertyAvailable) {
     return res
        .status(403)
        .json({ message: "Property not available to be booked in given date" });
    }
    else {      
        let loiData = req.body.loi;
        const ipAddress = requestIP.getClientIp(req);
        let loi = await LOI.create({

          bookingId: replacement.booking,
          tenantsId: tenantData?.id,
          loi: loiData,
          ipAddress: ipAddress

        });
        await Tenant.update(
          { loiUploaded: true },
          { where: { id: tenantData?.id } }
        );       
        const dataForPdf = {}
        const property = await Property.findByPk(booking.property)
        console.log(property,"44444444")
        dataForPdf['details'] = property.area, property.country

        var months;
        var date1 = new Date(booking.moveinDate);
        var date2 = new Date(booking.moveOutData);
        months = (date2.getFullYear() - date1.getFullYear()) * 12;
        months -= date1.getMonth() + 1;
        months += date2.getMonth();
        months = months <= 0 ? 0 : months;

        const tenant = await Tenant.findByPk(req.body.tenants)

        dataForPdf['details'] = property?.name + ',' + property?.area + ',' + property?.country
        dataForPdf['month'] = months
        dataForPdf['monthlyRent'] = booking.monthlyRent
        dataForPdf['startDate'] = booking.moveinDate
        dataForPdf['tenantName'] = tenant?.name
        dataForPdf['tenantPassport'] = tenant?.passport
        dataForPdf['signedDate'] = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`
        dataForPdf['ipAddress'] = ipAddress
        dataForPdf['extraTopicHeading'] = property.extraTopicHeading
        dataForPdf['extraTopicDetails'] = property.extraTopicDetails
        dataForPdf['accountHolderName'] = property.accountHolderName
        dataForPdf['bankName'] = property.accountHolderBank
        dataForPdf['accountNumber'] = property.accountNumber
        dataForPdf['otherTenant'] = await Tenant.findAll({
          where: {
            booking: replacement?.booking,
          }
        });        
        const pdfUrl = await pdfGenrator(dataForPdf)        
        await LOI.update({
          loi: pdfUrl
        },
          { where: { id: loi.id } }
        )

        await Tenant.update({
          loi: pdfUrl
        },
          {
            where: { id: tenantData.id }
          })
        let tenantDetails = await Tenant.findAll({
          where: { booking: replacement.booking }
        })
        await Replacement.update({
          loiPending:false,
        },{
          where:{id:req.body.replacementId}
        })
        const book = await Booking.findByPk(booking.id)
        res.status(201).json({ data: loi, booking: book, tenant_details: tenantDetails });      
    }
  } catch (error) {
    console.log("Error", error)
    res.status(500).json({ message: error });
  }
};

export const signContract = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findByPk(req.body.booking)
    if (!booking) {
      return res.status(403).json({ error: 'Booking Not found' })
    }
    if (booking.status !== 'document_verified') {
      return res.status(403).json({ error: 'Please complete all previous step' })
    }
    const tenant = await Tenant.findByPk(req.body.tenant)
    if (!tenant) {
      return res.status(403).json({ error: 'Tenant not found' })
    }
    const ipAddress = requestIP.getClientIp(req);

    const contract = await Contract.create({
      bookingId: req.body.booking,
      tenantsId: req.body.tenant,
      contract: req.body.contract,
      ipAddress: ipAddress
    })
    await tenant.update(
      { contractSigned: true }
    )
    let tenantDetails = await Tenant.findAll({
      where: { booking: req.body.booking, contractSigned: false, active: true }
    })    
    if (tenantDetails.length == 0) {
      await booking.update({
        status: 'contract_signed'
      })
    }
    tenantDetails = await Tenant.findAll({
      where: { booking: req.body.booking, active: true }
    })
    const property = await Property.findOne({ where: { id: booking.property } })
    const pdfData = {}
    var months;
    var date1 = new Date(booking.moveinDate);
    var date2 = new Date(booking.moveOutData);
    months = (date2.getFullYear() - date1.getFullYear()) * 12;
    months -= date1.getMonth() + 1;
    months += date2.getMonth();
    months = months <= 0 ? 0 : months;
    pdfData['signedDate'] = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`
    pdfData['details'] = property.name + ',' + property.area + ',' + property.country
    pdfData['months'] = months
    pdfData['startDate'] = booking.moveinDate
    pdfData['endDate'] = booking.moveOutData
    pdfData['monthlyrent'] = booking.monthlyRent
    pdfData['accountHolderName'] = property.accountHolderName
    pdfData['bankName'] = property.accountHolderBank
    pdfData['accountNumber'] = property.accountNumber
    pdfData['repairUpto'] = property.repairUpto
    pdfData['tenantName'] = tenant?.name
    pdfData['ipAddress'] = ipAddress
    pdfData['tenantPassport'] = tenant?.passport
    pdfData['otherTenant'] = tenantDetails
    const url = await singaporeContractGenerator(pdfData)

    await Tenant.update({
      contract: url
    },
      { where: { id: tenant.id } }
    )
    contract.update(
      { contract: url }
    )
    res.status(200).json({ booking: booking, tenantDetails: tenantDetails })

  } catch (error) {
    console.log("Error", error)
    res.status(500).json({ message: error });
  }
}
export const uploadContractForReplacement = async (req: Request, res: Response) => {
  try {
    if( !req.body.replacementId || !req.body.contract){
      return res
      .status(403)
      .json({ message: "please check the payload" });
    }
    const replacement = await Replacement.findByPk(req.body.replacementId)    
    const booking = await Booking.findByPk(replacement.booking)
    if (!booking) {
      return res.status(403).json({ error: 'Booking Not found' })
    }   
    const tenant = await Tenant.findOne({where:{
      email:replacement?.email,
      booking:replacement?.booking,
    }})
    if (!tenant) {
      return res.status(403).json({ error: 'Tenant not found' })
    }
    const ipAddress = requestIP.getClientIp(req);

    const contract = await Contract.create({
      bookingId: replacement.booking,
      tenantsId: tenant.id,
      contract: req.body.contract,
      ipAddress: ipAddress
    })
    await tenant.update(
      { contractSigned: true }
    )   
    let tenantDetails = await Tenant.findAll({
      where: { booking: replacement.booking, active: true }
    })
    const property = await Property.findOne({ where: { id: booking.property } })
    const pdfData = {}
    var months;
    var date1 = new Date(booking.moveinDate);
    var date2 = new Date(booking.moveOutData);
    months = (date2.getFullYear() - date1.getFullYear()) * 12;
    months -= date1.getMonth() + 1;
    months += date2.getMonth();
    months = months <= 0 ? 0 : months;
    pdfData['signedDate'] = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`
    pdfData['details'] = property?.name + ',' + property?.area + ',' + property?.country
    pdfData['months'] = months
    pdfData['startDate'] = booking.moveinDate
    pdfData['endDate'] = booking.moveOutData
    pdfData['monthlyrent'] = booking.monthlyRent
    pdfData['accountHolderName'] = property.accountHolderName
    pdfData['bankName'] = property.accountHolderBank
    pdfData['accountNumber'] = property.accountNumber
    pdfData['repairUpto'] = property.repairUpto
    pdfData['tenantName'] = tenant?.name
    pdfData['ipAddress'] = ipAddress
    pdfData['tenantPassport'] = tenant?.passport
    pdfData['otherTenant'] = tenantDetails
    const url = await singaporeContractGenerator(pdfData)

    await Tenant.update({
      contract: url
    },
      { where: { id: tenant.id } }
    )
    contract.update(
      { contract: url }
    )
    await Replacement.update({
      contractSignedPending:false,
    },{
      where:{id:req.body.replacementId}
    })
    res.status(200).json({ booking: booking, tenantDetails: tenantDetails })

  } catch (error) {
    console.log("Error", error)
    res.status(500).json({ message: error });
  }
}


export const verifyDocument = async (req: Request, res: Response) => {
  try {
    const startDate = new Date(req.body.moveinDate)
    const endDate = new Date(req.body.moveOutData)
    if (startDate > endDate) {
      return res.status(400).jsonp({ message: 'Check Out Date Can not be before Check In Date' })
    }
    if (endDate < new Date()) {
      return res.status(400).jsonp({ message: 'Check Out Date can not be in past' })
    }
    

    const booking = await Booking.update(
      {
        status: "document_verified",
        monthlyRent: req.body.price,
        moveinDate: req.body.moveinDate,
        moveOutData: req.body.moveOutData,
      },
      {
        where: { id: req.body.booking },
      }
    );

    const tenant = await Tenant.findAll({ where: { booking: req.body.booking } })

    res.status(200).json({ message: "Booking Approved", data: booking });
    const sendMail = tenant.map(async (item) => {
      await sendEmail(item?.email, "Document Verified", "Congratulation Your document has been verified please complete all other step to proceed", '')
    })
    await Promise.all(sendMail)
  } catch (error) {
    res.status(500).json({ err: 'Error while confirming the booking' })
  }
}

export const bookingConfirmation = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findOne({ where: { id: req.body.booking } })
    if (booking.status == 'booked') {
      return res.status(403).json({ message: 'Booking already confirmed' })
    }
    else if (booking.status == 'cancelled') {
      return res.status(403).json({ message: 'Booking was already cancelled in past' })
    }

    const startDate = new Date(req.body.moveinDate)
    const endDate = new Date(req.body.moveOutData)
    if (startDate > endDate) {
      return res.status(400).jsonp({ message: 'Check Out Date Can not be before Check In Date' })
    }
    if (endDate < new Date()) {
      return res.status(400).jsonp({ message: 'Check Out Date can not be in past' })
    }
 
    const tenants = await Tenant.findAll({
      where: { booking: req.body.booking }
    })
    const mailsend = tenants.map(async (item) => {
      
      await sendEmail(item.email, "Booking Confirmed", `Your Booking is Confirmed`, "")
    }
    )
    await Promise.all(mailsend)
    await Booking.update(
      {
        status: "booked",
        monthlyRent: req.body.price,
        moveinDate: req.body.moveinDate,
        moveOutData: req.body.moveOutData,
      },
      {
        where: { id: req.body.booking },
      }
    );
    res.status(200).json({ message: "Booking Approved", data: booking });

  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const requestDocument = async (req: Request, res: Response) => {
  try {
    const id = req.query.id;
    const tenants = await Tenant.findAll({
      where: { booking: id }
    })

    const booking = await Booking.findOne({ where: { id: id } })
    if (!booking) {
      return res.status(403).json({ message: 'Booking not found' })
    }
    const mailsend = tenants.map(async (item) => {
      if (booking.status == 'tenant_details') {
        await sendEmail(item?.email, "Document Request", "Your booking is on hold as some member has not submitted the document , Please complete the submission as soon as possible", '')
      }
      else if (booking.status == 'document_uploaded') {
        await sendEmail(item?.email, "LOI Signature", "Your booking is on hold as some member has not signed  the LOI , Please complete the submission as soon as possible", '')
      }
      else if (booking.status == 'contract_signed') {
        await sendEmail(item?.email, "LOI Signature", "Your booking is on hold as some member has not signed the Contract , Please complete the submission as soon as possible", '')
      }
      else {
        await sendEmail(item?.email, "LOI Signature", "Your booking is on hold as some member has not signed the Contract , Please complete the submission as soon as possible", '')
      }
    }
    )
    await Promise.all(mailsend)
    res.status(200).json({ message: 'mail sent' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error while sending request', error })
  }
}



export const cancelBookingAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const bookingQuerry = `select B.tenants , P.name, P.area , P.country from "Bookings" B join "Properties" P on P.id = B.property ::uuid where B.id=:id`;
    const bookResult = (await sequelize.query(bookingQuerry, {
      replacements: {
        id: req.query.id
      }
    })) as BookingWithProperty[][];

    const tenantsQuerry = `select "Tenants".email from "Tenants" where "Tenants".id in (:tenants)`;
    const tenantResult = (await sequelize.query(tenantsQuerry, {
      replacements: {
        tenants: bookResult[0][0].tenants
      }
    })) as Tenant[][];    
    tenantResult[0].map((item) => {
      sendEmail(item.email, "Booking Cancelation", `Your Booking for ${bookResult[0][0].name} at ${bookResult[0][0].area},${bookResult[0][0].country} has been cancelled by the Admin,any deposite amount that is will be refunded`, "")
    })

    await Booking.update({ status: "cancelled", cancelReasonHeading: req.body.cancelReason, cancleReasonDetails: req.body.cancelReasonDetails }, { where: { id: id } });

    res.status(200).json({ data: "Booking Cancelled" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const cancelBookingUser = async (req: userRequest, res: Response) => {
  try {
    const { id, refund } = req.query;
    const book = await Booking.update({ status: "cancelationRequest" }, { where: { id: id, bookedBy: req.user.user.id } });
    
    if (!book[0]) {
      return res.status(401).json({ message: 'Either Booking Doesnt exist or you are not the owner of booking ' })
    }
    let data: unknown;
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};


export const adminOngoingBookingList = async (req: Request, res: Response) => {
  try {
    const bookingQuerry = `SELECT B.id,B.status,B.property,P.name,p.area,B."monthlyRent",B."type", B."serviceFee",B."moveinDate",B."moveOutData",B.tenants,B."createdAt",C.name as city_name,C.country
    FROM "Bookings" B
    JOIN "Properties" P ON B.property::uuid = P.id 
    JOIN "Cities" C ON P.city=C.id
    WHERE B.status = 'document_uploaded'
    OR B.status = 'loi_signed'
    OR B.status = 'service_fee_paid'
    OR B.status = 'service_fee_partially_paid'
    OR B.status = 'final_payment_partially_done'
    OR B.status = 'final_payment_done'
    OR B.status = 'contract_signed'
    OR B.status = 'document_verified'
    ORDER BY B."createdAt" DESC
    `

    const result = (await sequelize.query(bookingQuerry, {
    })) as BookingWithDetails[][];


    res.status(200).json({ data: result[0] })

  } catch (error) {
    res.status(500).json({ message: error });

  }
}
export const adminCurrentBookingList = async (req: Request, res: Response) => {
  try {
    const bookingQuerry = `SELECT B.id,B.status,B.property,B.type,P.name,p.area,B."monthlyRent", B."serviceFee",B."moveinDate",B."moveOutData",B.tenants,B."createdAt",C.name as city_name,C.country
    FROM "Bookings" B
    JOIN "Properties" P ON B.property::uuid = P.id 
    JOIN "Cities" C ON P.city=C.id
    WHERE B.status = 'booked'
    AND B."moveOutData" >= current_date
    ORDER BY B."createdAt" DESC
    `
    const result = (await sequelize.query(bookingQuerry, {
    })) as BookingWithDetails[][];


    res.status(200).json({ data: result[0] })

  } catch (error) {
    res.status(500).json({ message: error });

  }
}
export const adminCancelBookingList = async (req: Request, res: Response) => {
  try {
    const bookingQuerry = `SELECT B.id,B.status,B.property,P.name,p.area,B."monthlyRent", B."serviceFee",B."moveinDate",B."moveOutData",B.tenants,B."createdAt",C.name as city_name,C.country
      FROM "Bookings" B
      JOIN "Properties" P ON B.property::uuid = P.id 
      JOIN "Cities" C ON P.city=C.id
      WHERE B.status = 'cancelled'
      ORDER BY B."createdAt" DESC
      `

    const result = (await sequelize.query(bookingQuerry, {
    })) as BookingWithDetails[][];


    res.status(200).json({ data: result[0] })
  } catch (error) {
    res.status(500).json({ message: error });
  }
}
export const adminPastBookingList = async (req: Request, res: Response) => {
  try {
    const bookingQuerry = `SELECT B.id,B.status,B.property,P.name,p.area,B."monthlyRent", B."serviceFee",B."moveinDate",B."moveOutData",B.tenants,B."createdAt",C.name as city_name,C.country
    FROM "Bookings" B
    JOIN "Properties" P ON B.property::uuid = P.id 
    JOIN "Cities" C ON P.city=C.id
    WHERE B.status = 'booked'
    AND B."moveOutData" < current_date
    ORDER BY B."createdAt" DESC
    `

    const result = (await sequelize.query(bookingQuerry, {
    })) as BookingWithDetails[][];


    res.status(200).json({ data: result[0] })

  } catch (error) {
    res.status(500).json({ message: error });

  }
}

export const adminBookingDashboardData = async (req: Request, res: Response) => {
  try {
    let bookingQuerry = `SELECT count(*)
    FROM "Bookings" B
    JOIN "Properties" P ON B.property::uuid = P.id 
    JOIN "Cities" C ON P.city=C.id
    WHERE B.status = 'booked'
    AND B."moveOutData" < current_date;
    `

    const bookingresultPast = (await sequelize.query(bookingQuerry, {
    })) as BookingWithDetails[][];

    bookingQuerry = `SELECT count(*)
    FROM "Bookings" B
    JOIN "Properties" P ON B.property::uuid = P.id 
    JOIN "Cities" C ON P.city=C.id
    WHERE B.status = 'booked'
    AND B."moveOutData" >= current_date
    `
    const bookingresultCurrent = (await sequelize.query(bookingQuerry, {
    })) as BookingWithDetails[][];

    bookingQuerry = `SELECT count(*)
    FROM "Bookings" B
    JOIN "Properties" P ON B.property::uuid = P.id 
    JOIN "Cities" C ON P.city=C.id
    WHERE B.status = 'document_uploaded'
       OR B.status = 'loi_signed'
       OR B.status = 'service_fee_paid'
       OR B.status = 'service_fee_partially_paid'
       OR B.status = 'final_payment_partially_done'
       OR B.status = 'final_payment_done'
       OR B.status = 'contract_signed'
       OR B.status = 'document_verified';
     `
    const bookingresultOngoing = (await sequelize.query(bookingQuerry, {
    })) as BookingWithDetails[][];

    res.status(200).json({ dataPast: bookingresultPast[0], dataCurrent: bookingresultCurrent[0], dataOngoing: bookingresultOngoing[0] })

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error })
  }
}
export const initiatereplacement = async (req: Request, res: Response) => {
  try {
    const { booking, name, comment, email, passport, reason, replaceFrom } = req.body
    let existReplace = await Replacement.findOne({
      where: {
        booking, status: "pending"
      }
    })
    if (existReplace) {
      return res.status(500).json({ message: "already in progress" })
    }
    let bookingData = await Booking.findByPk(booking)
    if (bookingData.status === "service_fee_partially_paid" || bookingData.status === "final_payment_partially_done" || bookingData.status === "cancelled" || bookingData.status === "booked") {
      return res.status(500).json({ message: "we cant proceed right now" })
    }
    let replace = await Replacement.create({
      booking, name, comment, email, passport, reason, replaceFrom, tenantDetailsAdded: 1
    })
    const documentNeeded = `select "documentNeeded" from "Cities" join "Properties" on "Properties".city="Cities".id
    where "Properties".id = :propertyId;`;
    const result = (await sequelize.query(documentNeeded, {
      replacements: { propertyId: bookingData.property },
    })) as City[];
    return res.status(200).json({ data: replace, documentsRequired: result, bookingData: bookingData })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error })
  }
}
export const replacementDocumentAdd = async (req: Request, res: Response) => {
  try {
    let doc = "";
    if (req.file) {
      doc = await uploadSingleFile(req.file);
    } else {
      return res.status(403).json({ message: "Document Not Found" });
    }
    const { documentName, replacementId } = req.body
    const replacement = await Replacement.findOne({ where: { id: replacementId } });
    if (!replacement) {
      return res.status(404).json({ message: "Replacement entry not found" });
    }
    let bookingData = await Booking.findByPk(replacement.booking)
    if (bookingData?.status === "tenant_details") {
      return res.status(404).json({ message: "You can Confirm Your Booking" });
    }
    const updatedDocuments = replacement.documents ? [...replacement.documents] : [];
    updatedDocuments.push({ name: documentName, url: doc });
    replacement.documents = updatedDocuments;
    await replacement.save()


    // 
    const list_of_document_uploaded = await Replacement.findByPk(replacementId)
    const uploaded_doc = [];
    list_of_document_uploaded?.documents?.forEach((item) => {
      uploaded_doc.push(item.name);
    });


    let documentNeeded = `select "documentNeeded" from "Cities" join "Properties" on "Properties".city="Cities".id
    where "Properties".id = :propertyId;`;
    const result = (await sequelize.query(documentNeeded, {
      replacements: { propertyId: bookingData.property },
    })) as City[];
    let documentNeededData = result[0][0]?.documentNeeded;
    const neededDocument = documentNeededData.map(item => item.name);

    const allDocumentsUploaded = neededDocument.every(doc => uploaded_doc.includes(doc));
    if (allDocumentsUploaded) {
      await Replacement.update({ documentUploaded: true }, {
        where: {
          id: replacementId
        }
      })
    }

    return res.status(200).json({ data: replacement })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error })
  }
}
export const replacementConfirm = async (req: Request, res: Response) => {
  try {
    let replacementData = await Replacement.findByPk(req.body.replacementId)    
    let bookingStatus = await Booking.findByPk(replacementData?.booking)        
    if (bookingStatus.status === "tenant_details" && replacementData.tenantDetailsAdded === true) {
      // create new tenant
      let newTenant = await Tenant.create({
        name: replacementData.name,
        email: replacementData.email,
        passport: replacementData.passport,
        booking: replacementData.booking,
        reason: replacementData?.reason,
        active: 1,
        loiUploaded: false,
        documentList: []
      })

      // add new tenent and remove old tenant
      let tenants = bookingStatus.tenants || [];
      tenants.push(newTenant.id);
      if (replacementData.replaceFrom) {
        tenants = tenants.filter(tenantId => tenantId !== replacementData.replaceFrom);
      }
      await bookingStatus.update({ tenants });


      // remove old tenant
      await Tenant.update({
        active: false
      }, {
        where: { id: replacementData?.replaceFrom }
      })

      // complete the replacement
      replacementData.status = "success"
      await replacementData.save()


    } else if (bookingStatus.status === "document_uploaded" && replacementData.documentUploaded === true) {
      // create new tenant
      let newTenant = await Tenant.create({
        name: replacementData.name,
        email: replacementData.email,
        passport: replacementData.passport,
        booking: replacementData.booking,
        reason: replacementData?.reason,
        active: 1,
        loiUploaded: false,
        documentList: []
      })
      // add new tenent and remove old tenant
      let tenants = bookingStatus.tenants || [];
      tenants.push(newTenant.id);
      if (replacementData.replaceFrom) {
        tenants = tenants.filter(tenantId => tenantId !== replacementData.replaceFrom);
      }
      await bookingStatus.update({ tenants });
      // remove old tenant
      await Tenant.update({
        active: false
      }, {
        where: { id: replacementData?.replaceFrom }
      })
      // complete the replacement
      replacementData.status = "success"
      await replacementData.save()
      await Promise.all(replacementData.documents.map(async (item) => {
        await Documents.create({
          tentantsId: newTenant.id,
          booking: replacementData.booking,
          documentName: item.name,
          document: item.url,
        });
      }));
      const tenantDocList = replacementData.documents.map((item) => item.name)
      await Tenant.update(
        { documentStatus: "completed", documentList: tenantDocList || [] },
        { where: { id: newTenant.id } }
      );
    } else if (bookingStatus.status === "loi_signed" && replacementData.documentUploaded === true) {
      // create new tenant
      let newTenant = await Tenant.create({
        name: replacementData.name,
        email: replacementData.email,
        passport: replacementData.passport,
        booking: replacementData.booking,
        reason: replacementData?.reason,
        active: 1,
        loiUploaded: false,
        documentList: []
      })
      // add new tenent and remove old tenant
      let tenants = bookingStatus.tenants || [];
      tenants.push(newTenant.id);
      if (replacementData.replaceFrom) {
        tenants = tenants.filter(tenantId => tenantId !== replacementData.replaceFrom);
      }
      await bookingStatus.update({ tenants, status: "document_uploaded" });
      // remove old tenant
      await Tenant.update({
        active: false
      }, {
        where: { id: replacementData?.replaceFrom }
      })
      // complete the replacement
      replacementData.status = "success"
      // replacementData.loiPending = true
      await replacementData.save()
      await Promise.all(replacementData.documents.map(async (item) => {
        await Documents.create({
          tentantsId: newTenant.id,
          booking: replacementData.booking,
          documentName: item.name,
          document: item.url,
        });
      }));
      const tenantDocList = replacementData.documents.map((item) => item.name)
      await Tenant.update(
        { documentStatus: "completed", documentList: tenantDocList || [] },
        { where: { id: newTenant.id } }
      );
    } else if (bookingStatus.status === "service_fee_paid" && replacementData.documentUploaded === true) {
      // create new tenant
      let newTenant = await Tenant.create({
        name: replacementData.name,
        email: replacementData.email,
        passport: replacementData.passport,
        booking: replacementData.booking,
        reason: replacementData?.reason,
        active: 1,
        loiUploaded: false,
        documentList: []
      })
      // add new tenent and remove old tenant
      let tenants = bookingStatus.tenants || [];
      tenants.push(newTenant.id);
      if (replacementData.replaceFrom) {
        tenants = tenants.filter(tenantId => tenantId !== replacementData.replaceFrom);
      }
      await bookingStatus.update({ tenants });
      // remove old tenant
      await Tenant.update({
        active: false
      }, {
        where: { id: replacementData?.replaceFrom }
      })
      // complete the replacement
      replacementData.status = "success"
      replacementData.loiPending = true
      replacementData.serviceFeePaid = true
      await replacementData.save()
      await Promise.all(replacementData.documents.map(async (item) => {
        await Documents.create({
          tentantsId: newTenant.id,
          booking: replacementData.booking,
          documentName: item.name,
          document: item.url,
        });
      }));
      const tenantDocList = replacementData.documents.map((item) => item.name)
      await Tenant.update(
        { documentStatus: "completed", documentList: tenantDocList || [] },
        { where: { id: newTenant.id } }
      );
    } else if (bookingStatus.status === "document_verified" && replacementData.documentUploaded === true) {
      // create new tenant
      let newTenant = await Tenant.create({
        name: replacementData.name,
        email: replacementData.email,
        passport: replacementData.passport,
        booking: replacementData.booking,
        reason: replacementData?.reason,
        active: 1,
        loiUploaded: false,
        documentList: []
      })
      // add new tenent and remove old tenant
      let tenants = bookingStatus.tenants || [];
      tenants.push(newTenant.id);
      if (replacementData.replaceFrom) {
        tenants = tenants.filter(tenantId => tenantId !== replacementData.replaceFrom);
      }
      await bookingStatus.update({ tenants });
      // remove old tenant
      await Tenant.update({
        active: false
      }, {
        where: { id: replacementData?.replaceFrom }
      })
      // complete the replacement
      replacementData.status = "success"
      replacementData.loiPending = true
      replacementData.serviceFeePaid = true
      await replacementData.save()
      await Promise.all(replacementData.documents.map(async (item) => {
        await Documents.create({
          tentantsId: newTenant.id,
          booking: replacementData.booking,
          documentName: item.name,
          document: item.url,
        });
      }));
      const tenantDocList = replacementData.documents.map((item) => item.name)
      await Tenant.update(
        { documentStatus: "completed", documentList: tenantDocList || [] },
        { where: { id: newTenant.id } }
      );
    } else if (bookingStatus.status === "contract_signed" && replacementData.documentUploaded === true) {
      // create new tenant
      let newTenant = await Tenant.create({
        name: replacementData.name,
        email: replacementData.email,
        passport: replacementData.passport,
        booking: replacementData.booking,
        reason: replacementData?.reason,
        active: 1,
        loiUploaded: false,
        documentList: []
      })
      // add new tenent and remove old tenant
      let tenants = bookingStatus.tenants || [];
      tenants.push(newTenant.id);
      if (replacementData.replaceFrom) {
        tenants = tenants.filter(tenantId => tenantId !== replacementData.replaceFrom);
      }
      await bookingStatus.update({ tenants });
      // remove old tenant
      await Tenant.update({
        active: false
      }, {
        where: { id: replacementData?.replaceFrom }
      })
      // complete the replacement
      replacementData.status = "success"
      replacementData.loiPending = true
      replacementData.serviceFeePaid = true
      replacementData.contractSignedPending = true
      await replacementData.save()
      await Promise.all(replacementData.documents.map(async (item) => {
        await Documents.create({
          tentantsId: newTenant.id,
          booking: replacementData.booking,
          documentName: item.name,
          document: item.url,
        });
      }));
      const tenantDocList = replacementData.documents.map((item) => item.name)
      await Tenant.update(
        { documentStatus: "completed", documentList: tenantDocList || [] },
        { where: { id: newTenant.id } }
      );
    }else if (bookingStatus.status === "final_payment_done" && replacementData.documentUploaded === true) {
      // create new tenant
      let newTenant = await Tenant.create({
        name: replacementData.name,
        email: replacementData.email,
        passport: replacementData.passport,
        booking: replacementData.booking,
        reason: replacementData?.reason,
        active: 1,
        loiUploaded: false,
        documentList: []
      })
      // add new tenent and remove old tenant
      let tenants = bookingStatus.tenants || [];
      tenants.push(newTenant.id);
      if (replacementData.replaceFrom) {
        tenants = tenants.filter(tenantId => tenantId !== replacementData.replaceFrom);
      }
      await bookingStatus.update({ tenants });
      // remove old tenant
      await Tenant.update({
        active: false
      }, {
        where: { id: replacementData?.replaceFrom }
      })
      // complete the replacement
      replacementData.status = "success"
      replacementData.loiPending = true
      replacementData.serviceFeePaid = true
      replacementData.contractSignedPending = true
      await replacementData.save()
      await Promise.all(replacementData.documents.map(async (item) => {
        await Documents.create({
          tentantsId: newTenant.id,
          booking: replacementData.booking,
          documentName: item.name,
          document: item.url,
        });
      }));
      const tenantDocList = replacementData.documents.map((item) => item.name)
      await Tenant.update(
        { documentStatus: "completed", documentList: tenantDocList || [] },
        { where: { id: newTenant.id } }
      );
    }

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error })
  }
}
export const checkPendingContracts = async (req: userRequest, res: Response) => {
  try {    
    const userEmail= req.user.user.email    
    let replacementData = await Replacement.findOne({
      where: {
        email: userEmail,        
        [Op.or]: [
          { loiPending: true },
          { contractSignedPending: true }
        ]
      }
    });
 
    res.status(200).json({ replacementData: replacementData,error:false })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error })
  }
}

export const adminSingleBookingDetails = async (req: Request, res: Response) => {
  try {
    const bookingQuery = `Select B.status as booking_status,* from "Bookings" B  
    JOIN "Properties" P ON B.property::uuid = P.id 
    where B.id=:id`
    const bookResult = (await sequelize.query(bookingQuery, {
      replacements: {
        id: req.query.id
      }
    })) as BookingWithDetails[][];

    const tentantsQuery = `select
                *
              from
                "Tenants"
              where
                "Tenants".id in (:tenants);`

    const tenantResult = (await sequelize.query(tentantsQuery, {
      replacements: {
        tenants: bookResult[0][0].tenants
      }
    })) as Tenant[];
    const documentQuerry = `select * from "Documents" where "Documents"."tentantsId" in (:tenants) `
    const documentResult = (await sequelize.query(documentQuerry, {
      replacements: {
        tenants: bookResult[0][0].tenants
      }
    })) as Tenant[];

    const paymentQuerry = `select * from "Payments" where "Payments".booking=:bookingId `
    const paymentResult = (await sequelize.query(paymentQuerry, {
      replacements: {
        bookingId: req.query.id
      }
    })) as Payment[];

    res.status(200).json({ booking: bookResult[0], tentants: tenantResult[0], document: documentResult[0], payment: paymentResult[0] })

  } catch (error) {
    res.status(500).json({ message: error });
  }
}

export const adminUpdateCurrentBooking = async (req: Request, res: Response) => {
  try {
    const moveinDate = req.body.moveinDate
    const moveOutData = req.body.moveOutData
    const booking = await Booking.findOne({ where: { id: req.body.booking } })
    if (!booking) {
      return res.status(403).json({ message: 'Cant find the booking' });

    }
    if (booking.status !== 'booked') {
      return res.status(403).json({ message: 'Status of booking is not confirmed' })
    }
    const startDate = new Date(moveinDate)
    const endDate = new Date(moveOutData)    
    if (startDate > endDate) {
      return res.status(403).json({ message: 'Move In Date cant be after move out date' })
    }

    await Booking.update(
      {
        status: "booked",
        monthlyRent: req.body.price,
        moveinDate: req.body.moveinDate,
        moveOutData: req.body.moveOutData,
      },
      {
        where: { id: req.body.booking },
      }

    );
    res.status(200).json({ message: 'Updated the Data' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error })
  }
}

