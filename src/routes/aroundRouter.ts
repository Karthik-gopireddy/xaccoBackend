import express, { Router } from 'express';
import { createAroundTown, getAroundTown } from '../controllers/arountownController';
const aroundRouter: Router = express.Router();


aroundRouter.post('/',createAroundTown)
aroundRouter.get('/',getAroundTown)

export default aroundRouter;
