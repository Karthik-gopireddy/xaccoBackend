import { Request, Response } from "express";
import { Rating } from "../models/rating.Schema";

export interface RequestWithUser extends Request {
  user: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}
export const createRating = async (req: RequestWithUser, res: Response) => {
  
  try {
    const rating = await Rating.create({
      propertyId: req.body.propertyId,
      userId: req.user.user.id,
      rating: req.body.rating,
      comment: req.body.comment || null,
    });
    res.status(201).json({ data: rating });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
export const updateRating = async (req: RequestWithUser, res: Response) => {
  
  try {
    const updateFields: { [key: string]:unknown } = {};
    if(req.body.rating)
    {
        updateFields.rating= req.body.rating
    }
    if(req.body.comment)
    {
        updateFields.comment= req.body.comment
    }
    
     await Rating.update(updateFields,{
        where:{id:req.query.id}
    })
    res.status(201).json({message:"Rating updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
