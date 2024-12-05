import { Request, Response } from 'express';

export const googleauth = async (req: Request, res: Response): Promise<void> => {
  try {
    const {name , email} = req.body;
 

  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
