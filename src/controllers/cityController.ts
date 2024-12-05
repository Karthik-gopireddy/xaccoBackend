import { Request, Response } from "express";
import { City } from "../models/city.Schema";
import { uploadSingleFile } from "../utils/s3-setup";
import { sequelize } from "../db/sequelize";
import { Op } from "sequelize";
import { Property } from "../models/property.Schema";
import { createSearchData } from "./searchController";

export const createCity = async (req: Request, res: Response) => {
  try {
    const image: string[] = [];
    let cardImage: string | undefined;
    let cityIcon: string | undefined;

    if (req.files) {
      // Handle 'images' field
      if ('images' in req.files) {
        const filesArray = req.files['images'] as Express.Multer.File[];
        if (filesArray && Array.isArray(filesArray)) {
          await Promise.all(
            filesArray.map(async (item) => {
              const img = await uploadSingleFile(item);
              image.push(img);
            })
          );
        }
      }

      // Handle 'cardImage' field
      if ('cardImage' in req.files) {
        const file = req.files['cardImage'][0] as Express.Multer.File;
        cardImage = await uploadSingleFile(file);
      }
      if ('cityIcon' in req.files) {
        const file = req.files['cityIcon'][0] as Express.Multer.File;
        cityIcon = await uploadSingleFile(file);
      }
    }

    // const documentNeeded = JSON.parse(req.body.documents);
      
    const city = await City.create({
      name: req.body.name,
      country: req.body.country,
      countryCode: req.body.countryCode,
      currencyCode: req.body.currencyCode,
      currencyIcon: req.body.currencyIcon,      
      images: image,  
      cityIcon:cityIcon,
      cardImage:cardImage,    
      about: req.body.about,
      documentNeeded: JSON.parse(req.body.documents),
    });

    await createSearchData(`${city.name} , ${city.country}`,`city=${city.name}&country=${city.country}`)
    await createSearchData(`${city.country}`,`country=${city.country}`)

    res.status(201).json({ data: city });
  } catch (error) {
    console.log(error,"Error")
    res.status(500).json({ message: error });
  }
};

export const deleteCity = async (req, res) => {
  try {
    const { id } = req.query;  // Get city ID from query parameter

    if (!id) {
      return res.status(400).json({ message: 'City ID is required' });
    }

    // Find the city first to ensure it exists
    const city = await City.findOne({ where: { id } });

    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    // Update the city status to 'disabled'
    const updatedCity = await City.update(
      { status: 'disabled' },
      { where: { id } }
    );

    if (updatedCity[0] === 0) {
      return res.status(500).json({ message: 'Failed to disable city' });
    }

    res.status(203).json({ message: 'City disabled successfully' });
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCity = async (req: Request, res: Response) => {
  try {
    const cityId = req.query.id; // Assuming id is passed as a parameter

    const image: string[] = [];
    if (req.files) {
      const fieldname = "images";

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
        }
      }
    }
    


    const updates: { [key: string]: unknown } = {};

    if (req.body.name) {
      updates.name = req.body.name;
    }
    if (req.body.country) {
      updates.country = req.body.country;
    }
    if (req.body.about) {
      updates.about = req.body.about;
    }
    if (req.body.documents) {
      updates.documentNeeded = JSON.parse(req.body.documents);
    }
    if (image.length > 0) {
      updates.images = image;
    }

    const [rowsUpdated, [updatedCity]] = await City.update(updates, {
      where: { id: cityId },
      returning: true, // return the updated rows
    });

    if (rowsUpdated === 0) {
      return res.status(404).json({ message: "City not found" });
    }

    res.status(200).json({ data: updatedCity });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error });
  }
};

export const getCity = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    if (id) {
      const city = await City.findOne({
        where: { id: id },
      });
      if (!city) {
        res.status(403).json({ message: "City doesnt exist" });
      }
      res.status(200).json({ data: city });
    } else {
      const city = await City.findAll({order: [['createdAt', 'DESC']]});
      res.status(200).json({ data: city });
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
};




// get city's for onbording------------------------------------------


export const getCityOnbording= async(req: Request, res: Response) =>{
  try {
    
    const allCities = await City.findAll({
      attributes: ['id', 'name', 'images','cardImage'],
      where: {
      id: {
        [Op.in]: sequelize.literal('(SELECT "Properties"."city" FROM "Properties" WHERE "Properties"."status" NOT IN (\'disable\'))')
      }
    }   
    });      
    return res.status(200).json({ data: allCities,message:'all cities'});
    
  } catch (err) {
    console.log(err)
    return res.status(500).json({message:err.message});
  }
};

export const cityProperties = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;

    let whereCondition = {}; 
    if (id) {
      whereCondition = { city: id };
    }

    const getAllProperties = await Property.findAll({
      where: whereCondition,
      raw: true,
    });

    return res.status(200).json({ data: getAllProperties });
  } catch (err) {
    console.error('Error fetching city properties:', err);
    return res.status(500).json({ error: err.message });
  }
};