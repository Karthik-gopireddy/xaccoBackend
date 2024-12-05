import express, { Router } from 'express';
import {createFaq, deleteFaq, getFaq,adminFaq } from '../controllers/faqController';
const faqRouter: Router = express.Router();


faqRouter.post('/',createFaq)
faqRouter.get('/',getFaq)
faqRouter.put('/',adminFaq)
faqRouter.delete('/',deleteFaq)





export default faqRouter;
