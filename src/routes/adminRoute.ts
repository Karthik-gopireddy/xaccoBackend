import express, { Router } from 'express';
import { adminLogin } from '../controllers/adminController';
import { adminSignUp } from '../controllers/adminController';
const adminRouter: Router = express.Router();


adminRouter.post('/signUp',  adminSignUp )
adminRouter.post('/login',adminLogin)
export default adminRouter;
