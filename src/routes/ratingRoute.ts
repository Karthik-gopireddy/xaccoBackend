import express,{Router} from 'express';
import { createRating, updateRating } from '../controllers/ratingController';
import { userTypeMiddleware } from '../middleware/auth.middleware';

const ratingRouter:Router =express.Router();

ratingRouter.post('/',userTypeMiddleware("customer"),createRating);
ratingRouter.patch('/',userTypeMiddleware("customer"),updateRating)
export default ratingRouter;