import { Request, Response } from 'express';
import { University } from '../models/university.Schema';
import { uploadSingleFile } from '../utils/s3-setup';
import { Property } from '../models/property.Schema';
import { Op, Sequelize } from 'sequelize';
import { createSearchData } from './searchController';





export const universityCreation = async (req: Request, res: Response): Promise<void> => {
  try {
    const img = await uploadSingleFile(req.file)
    const newUni = await University.create({
     name:req.body.name||null,
     city:req.body.city||null,
     country:req.body.country||null,
     logo:img
    });

    await createSearchData(`${newUni.name} , ${newUni.city} , ${newUni.country}`,`university=${newUni.name}&city=${newUni.city}&country=${newUni.country}`)

    res.status(201).json({status:true, data:newUni});
  } catch (error) {
    // console.error('Error creating unversity:', error);
    res.status(500).json({ error: error, });
  }
};

export const deleteUniversity = async (req:Request, res:Response) :Promise<void> =>{
    try {
        const {id} = req.query;
        const deletedUniversity =await University.destroy({where: {id:id}})

        
        if(!deletedUniversity)
        {
            res.status(403).json({message:"University doesnot exist"})
        }
        else
        {
            await Property.update(
                { universityAssociated: Sequelize.fn('array_remove', Sequelize.col('universityAssociated'), id) },
                { where: { universityAssociated: { [Op.contained]: [id] } } }
            );


            res.status(200).json({message:"delete successfully",data:deletedUniversity})

            
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message:error})
    }
}

export const getUniversity = async (req:Request, res:Response) :Promise<void> =>{
    try {
        const {id}=req.query;
        if(id)
        {
            const uni =await University.findOne({where:{id:id}})
            if(!uni)
            {
                res.status(403).json({message:"University doesnt exist"})
            }
            else
            {
                res.status(200).json({data:uni})

            }
        }
        else
        {
            const uni = await University.findAll({order: [['createdAt', 'DESC']]});
            res.status(200).json({data:uni})
        }

    } catch (error) {
        res.status(500).json({message:error})
    }
}


export const universityUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    let img = "";

    if (req.file) {
      img = await uploadSingleFile(req.file);
    }

    const universityId = req.query.id; 

    const updateFields: { [key: string]:unknown } = {};

    if (req.body.name) {
      updateFields.name = req.body.name;
    }

    if (req.body.city) {
      updateFields.city = req.body.city;
    }

    if (req.body.country) {
      updateFields.country = req.body.country;
    }

    if (img) {
      updateFields.logo = img;
    }

    const [numOfRowsUpdated, updatedUniversities] = await University.update(updateFields, {
      where: { id: universityId },
      returning: true, 
    });

    if (numOfRowsUpdated > 0) {
      res.status(200).json({ status: true, data: updatedUniversities[0] });
    } else {
      res.status(404).json({ status: false, message: "University not found" });
    }
  } catch (error) {
    console.error("Error updating university:", error);
    res.status(500).json({ error: error });
  }
};

 
