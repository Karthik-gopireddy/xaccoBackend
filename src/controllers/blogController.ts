import e, { Request, Response } from "express";
import { Blogs } from "../models/blog.Schema";
import { uploadSingleFile } from "../utils/s3-setup";


export const deleteBlogs = async (req: Request, res: Response) => {
    try {
      const { id } = req.query; 
      const blogs = await Blogs.destroy({
        where:{id}
      })
      if (!blogs) {
        res.status(403).json({ message: "blogs doesnt exist" });
      }
      res.status(203).json({ data: blogs });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  };
export const getBlogs = async (req: Request, res: Response) => {
    try {
      const { id } = req.query;
      if (id) {
        const blogs = await Blogs.findOne({
          where: { id: id },
        });
        if (!blogs) {
          res.status(403).json({ message: "blogs doesnt exist" });
        }
        res.status(200).json({ data: blogs });
      } else {
        const blogs = await Blogs.findAll({order: [['createdAt', 'DESC']]});
        res.status(200).json({ data: blogs });
      }
    } catch (error) {
      res.status(500).json({ message: error });
    }
  };
export const updateBlogs = async (req: Request, res: Response) => {
    try {
      const blogsId = req.body.id; // Assuming id is passed as a parameter      
      const updates: { [key: string]: unknown } = {};      
      if (req.files) {
          // Handle 'bannerImage' field
          if ('bannerImage' in req.files) {
              const file = req.files['bannerImage'][0] as Express.Multer.File;
              updates.bannerImage = await uploadSingleFile(file); // Call your upload function to save and get file path
          }

          // Handle 'image' field
          if ('image' in req.files) {
              const file = req.files['image'][0] as Express.Multer.File;
              updates.image = await uploadSingleFile(file); // Call your upload function to save and get file path
          }
      }
      if (req.body.heading) {
        updates.heading = req.body.heading;
      }
      if (req.body.category) {
        updates.category = req.body.category;
      }
      if (req.body.description) {
        updates.description = req.body.description;
      }            
  
      const [rowsUpdated, [updatedCity]] = await Blogs.update(updates, {
        where: { id: blogsId },
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
export const create = async (req: Request, res: Response) => {
    try {    
        let bannerImage:string | undefined;
        let image:string| undefined
        if (req.files) {
            // Handle 'bannerImage' field
            if ('bannerImage' in req.files) {
                const file = req.files['bannerImage'][0] as Express.Multer.File;
                bannerImage = await uploadSingleFile(file); // Call your upload function to save and get file path
            }

            // Handle 'image' field
            if ('image' in req.files) {
                const file = req.files['image'][0] as Express.Multer.File;
                image = await uploadSingleFile(file); // Call your upload function to save and get file path
            }
        }
        const blog = await Blogs.create({
            heading: req.body.heading,
            category: req.body.category,
            description: req.body.description,
            image,
            bannerImage,
        });
        res.status(201).json({ data: blog })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error })
    }
}