import express, { Router } from 'express';
import { UserSignUp, sendTest, sendVerificationLink, userLogin, verifyUser } from '../controllers/users.Controller';
// import {  googleAuthController,googleAuthCallbackController } from '../middleware/auth.middleware';
const userRouter: Router = express.Router();


userRouter.post('/signUp',  UserSignUp )
userRouter.post('/login',userLogin)
userRouter.get('/verifyUser',verifyUser)
userRouter.post('/sendVerificationLink',sendVerificationLink )



userRouter.post('/send',sendTest )





// userRouter.get('/auth/google', googleAuthController);
// userRouter.get('/auth/google/callback', googleAuthCallbackController);
export default userRouter;
