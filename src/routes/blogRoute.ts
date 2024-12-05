import express, { Router } from 'express';
import { create, getBlogs, deleteBlogs, updateBlogs } from '../controllers/blogController';
import multer from 'multer';
import { userTypeMiddleware } from '../middleware/auth.middleware';
const blogRouter: Router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

blogRouter.post('/', userTypeMiddleware('Admin'), upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "image", maxCount: 1 }
]), create)
blogRouter.get('/', getBlogs)
blogRouter.delete('/', userTypeMiddleware('Admin'), deleteBlogs)
blogRouter.patch('/', userTypeMiddleware('Admin'), upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "image", maxCount: 1 }
]), updateBlogs)
export default blogRouter;


