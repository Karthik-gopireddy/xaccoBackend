import express, { Router } from 'express';
import { adminUpdateEnquiryStatus, createEnquiry, getEnquiryAdmin,createEnquiryAbout,getEnquiryAdminAbout, createNewsLetter, getNewsLetterFroAdmin, createContactUs, getContactUs } from '../controllers/enquiryController';
const enquiryRoute: Router = express.Router();


enquiryRoute.post('/',createEnquiry)
enquiryRoute.get('/',getEnquiryAdmin)
enquiryRoute.get('/update',adminUpdateEnquiryStatus)




// about
enquiryRoute.post('/about',createEnquiryAbout)
enquiryRoute.get('/about',getEnquiryAdminAbout)



// news letter
enquiryRoute.post('/news-letter',createNewsLetter)
enquiryRoute.get('/news-letter',getNewsLetterFroAdmin)



// contact page
enquiryRoute.post('/contact',createContactUs)
enquiryRoute.get('/contact',getContactUs)

export default enquiryRoute;
