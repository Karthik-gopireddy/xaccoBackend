// app.ts
import express, { Request, Response, urlencoded } from 'express';
import { sequelize } from './db/sequelize';

import userRouter from './routes/userRoute';
import adminRouter from './routes/adminRoute';
import cityRouter from './routes/cityRoute';
import universityRouter from './routes/universityRoute';
import propertyRouter from './routes/propertyRoute';
import blogRoute from './routes/blogRoute';
import ratingRouter from './routes/ratingRoute';
import bookingRouter from './routes/bookingRoute';
import cors from 'cors'
import paymentRouter from './routes/paymentroute';
import faqRouter from './routes/faqRoute';
import searchRouter from './routes/searchRoute';
import adminBankRoute from './routes/adminBankRoute';
import { generateLOi, uploadSingleImage } from './utils/uploadImage';
import aroundRouter from './routes/aroundRouter';
import enquiryRoute from './routes/enquiryRoute';
import signRouter from './routes/signRoute';
import { Replacement } from './models/replacement.Schema';
import { Tenant } from './models/tenant.Schema';
import { Contract } from './models/contract.Schema';
import { Booking } from './models/booking.Schema';
import { Documents } from './models/document.Schema';
import { LOI } from './models/loi.Schema';
import dotenv from 'dotenv';

dotenv.config();

console.log('Loaded DATABASE_URL:', process.env.DATABASE_URL);

const port = process.env.PORT || 7072;
const app = express();
app.use(cors())
app.use(express.json());
app.use(urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use('/users', userRouter)
app.use('/admin',adminRouter)
app.use('/property',propertyRouter)
app.use('/university',universityRouter)
app.use('/rating',ratingRouter)
app.use('/city',cityRouter)
app.use('/booking',bookingRouter);
app.use('/payment',paymentRouter);
app.use('/search',searchRouter);
app.use('/aroundTown',aroundRouter);
app.use('/enquiry',enquiryRoute);
app.use('/signDocument',signRouter)
app.use('/faq',faqRouter)
app.use('/blogs',blogRoute)
app.use('/admin-bank',adminBankRoute)


app.post('/uploadImage',uploadSingleImage);
app.get('/generatePdf',generateLOi);
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello, TypeScript Express with PostgreSQL!' });
});
// app.get('/auth/google', googleAuthController);
// app.get('/auth/google/callback', googleAuthCallbackController);





app.listen(port, async () => {
  try { 
    // Check the database connection
    await sequelize.authenticate();
    console.log('Connected to the database');    
    // Sync the Sequelize models with the database
    await sequelize.sync({ force: false });
    console.log('Sequelize models synchronized with the database');

    console.log(`Server is running on port ${port}`);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
});
