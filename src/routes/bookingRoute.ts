import express,{Router} from 'express';
import { userTypeMiddleware } from '../middleware/auth.middleware';
import { addDocument, addTenents,replacementDocumentAdd,uploadContractForReplacement,uploadLoiForReplacement,checkPendingContracts,adminBookingDashboardData,initiatereplacement, replacementConfirm,adminCancelBookingList, adminCurrentBookingList, adminOngoingBookingList, adminPastBookingList, adminSingleBookingDetails, adminUpdateCurrentBooking, bookingConfirmation, cancelBookingAdmin, cancelBookingUser, editTenants, getSingleBooking, initialBooking, pastBooking, requestDocument, sendReminder, signContract, singleBooking, uploadLoi, verifyDocument } from '../controllers/bookingController';
import multer from 'multer';
const bookingRouter:Router = express.Router();

const storage= multer.memoryStorage();
const upload = multer({storage:storage})

bookingRouter.post('/initialBooking',userTypeMiddleware('customer'),initialBooking);
bookingRouter.post('/addTenants',userTypeMiddleware('customer'),addTenents)
bookingRouter.post('/editTenants',userTypeMiddleware('customer'),editTenants)
bookingRouter.post('/addDocument',upload.single('document'),addDocument)
bookingRouter.post('/send-reminder',sendReminder)

bookingRouter.post('/addLoi',upload.single('loi'),uploadLoi)
bookingRouter.get('/requestDocument',userTypeMiddleware('customer'),requestDocument)
// All the payment step is in payment controller
bookingRouter.post('/signContract',userTypeMiddleware('customer'),signContract)


bookingRouter.get('/singleBooking',singleBooking)


bookingRouter.get('/ongoingUserBooking',userTypeMiddleware('customer'),getSingleBooking);
bookingRouter.get('/pastUserBooking',userTypeMiddleware('customer'),pastBooking);



bookingRouter.post('/cancelBookingAdmin',userTypeMiddleware('Admin'),cancelBookingAdmin);
bookingRouter.get('/cancelBookingUser',userTypeMiddleware('customer'),cancelBookingUser);

// Admin
bookingRouter.post('/verifyDocument',userTypeMiddleware('Admin'),verifyDocument)

bookingRouter.get('/adminOngoingBookingList',userTypeMiddleware('Admin'),adminOngoingBookingList)
bookingRouter.get('/adminCurrentBookingList',userTypeMiddleware('Admin'),adminCurrentBookingList)
bookingRouter.get('/adminCancelBookingList',userTypeMiddleware('Admin'),adminCancelBookingList)
bookingRouter.get('/adminPastBookingList',userTypeMiddleware('Admin'),adminPastBookingList)
bookingRouter.get('/getBookingSingle',userTypeMiddleware('Admin'),adminSingleBookingDetails)
bookingRouter.post('/confirmBooking',userTypeMiddleware('Admin'),bookingConfirmation)
bookingRouter.post('/updateCurrentBooking',userTypeMiddleware('Admin'),adminUpdateCurrentBooking)
bookingRouter.get('/getBookingDashboardData',userTypeMiddleware('Admin'),adminBookingDashboardData)



// replacement
bookingRouter.post('/replacement',userTypeMiddleware('Admin'),initiatereplacement)
bookingRouter.post('/replacement-document',userTypeMiddleware('Admin'),upload.single('document'),replacementDocumentAdd)
bookingRouter.post('/replacement-confirm',userTypeMiddleware('Admin'),upload.single('document'),replacementConfirm)
bookingRouter.get('/check-pending-contract',userTypeMiddleware('customer'),checkPendingContracts)
bookingRouter.post('/replacement-loi-update',upload.single('loi'),uploadLoiForReplacement)
bookingRouter.post('/replacement-contract-update',uploadContractForReplacement)

        
export default bookingRouter