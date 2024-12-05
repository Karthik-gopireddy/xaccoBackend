import express, {  Router } from "express";
import multer from 'multer';
import { createPaySpilit, getPaymentList, handlePaymentCompletion, refundOfflinePayment, servicePaymentOffline, servicePaymentOnline } from "../controllers/paymentController";
import { userTypeMiddleware } from "../middleware/auth.middleware";
const paymentRouter:Router =express.Router()

const storage =multer.memoryStorage()
const upload =multer({storage:storage})

paymentRouter.post('/servicePaymentOffline',userTypeMiddleware('customer'),upload.single('paymentProof'),servicePaymentOffline)
paymentRouter.post('/refundOfflineAmount',userTypeMiddleware('Admin'),refundOfflinePayment)

paymentRouter.post('/create-payment-intent',userTypeMiddleware('customer'),servicePaymentOnline)
paymentRouter.post('/complete',handlePaymentCompletion)

paymentRouter.post('/createPaymentSpilit',userTypeMiddleware('customer'),createPaySpilit)
paymentRouter.get('/getPaymentList',userTypeMiddleware('customer'),getPaymentList)
export default paymentRouter;