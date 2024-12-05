import express,{Router} from 'express';
import { userTypeMiddleware } from '../middleware/auth.middleware';
import { cityProperties, createCity, deleteCity, getCity, getCityOnbording, updateCity } from '../controllers/cityController';
import multer from 'multer';

const storage = multer.memoryStorage()
const upload= multer({storage:storage})

const cityRouter:Router =express.Router();

cityRouter.post('/',userTypeMiddleware('Admin'),upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'cardImage', maxCount: 1 },
    { name: 'cityIcon', maxCount: 1 }
  ]),createCity);
cityRouter.patch('/',userTypeMiddleware('Admin'),upload.fields([{name:'images',maxCount:5}]),updateCity);
cityRouter.get('/',getCity)
cityRouter.delete('/', userTypeMiddleware('Admin'), deleteCity);









// get cities and id--------------------------------
cityRouter.get('/allCity',  getCityOnbording)
cityRouter.get('/allproperties',cityProperties)
export default cityRouter;