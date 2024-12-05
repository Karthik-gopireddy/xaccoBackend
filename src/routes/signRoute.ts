import express, { Router } from 'express';
import { sendDocumet } from '../controllers/signController';
const signRouter:Router = express.Router();

signRouter.post('/sendDocumet',sendDocumet)

export default signRouter;