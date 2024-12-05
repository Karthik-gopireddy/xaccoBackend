import express, { Router } from 'express';
import { generateSuggestion, getPropertyList } from '../controllers/searchController';
import { getPricing } from '../controllers/priceController';
const searchRouter: Router = express.Router();

searchRouter.get('/getSearchList',generateSuggestion)
searchRouter.get('/getPropertyList',getPropertyList)
searchRouter.get('/getPricing',getPricing)

export default searchRouter;