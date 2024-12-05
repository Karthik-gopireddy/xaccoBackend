import express, { Router } from 'express';
import { create, deleteBank, getAllBanks, updateBank } from '../controllers/adminBankController';
import multer from 'multer';
import { userTypeMiddleware } from '../middleware/auth.middleware';
const adminBankRoute: Router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

adminBankRoute.post('/', userTypeMiddleware('Admin'), create)
adminBankRoute.get('/', getAllBanks)
adminBankRoute.delete('/', userTypeMiddleware('Admin'), deleteBank)
adminBankRoute.patch('/', userTypeMiddleware('Admin'), updateBank)
export default adminBankRoute;


