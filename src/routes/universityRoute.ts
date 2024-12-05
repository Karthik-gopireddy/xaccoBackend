import express, { Router } from 'express';
import { deleteUniversity, getUniversity, universityCreation, universityUpdate } from '../controllers/universityController';
import multer from 'multer';
import { userTypeMiddleware } from '../middleware/auth.middleware';
const universityRouter: Router = express.Router();

const storage = multer.memoryStorage()
const upload= multer({storage:storage});


universityRouter.post('/',userTypeMiddleware("Admin"),upload.single('logo'),universityCreation )
universityRouter.get('/',getUniversity)
universityRouter.delete('/',userTypeMiddleware("Admin"),deleteUniversity)
universityRouter.patch('/',userTypeMiddleware("Admin"),upload.single('logo'),universityUpdate)
export default universityRouter;
