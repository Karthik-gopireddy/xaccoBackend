import express, { Router } from "express";
// import { userTypeMiddleware } from '../middleware/auth.middleware';
import { addPropertyToWishlist, adminGetProperty, availableProperty, createProperty, deleteProperty, getProperty, getPropertyById, removePropertyFromWishlist, updateProperty, wishListProperty } from "../controllers/propertyController";
import multer from "multer";
import { userTypeMiddleware } from "../middleware/auth.middleware";
const propertyRouter: Router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

propertyRouter.post(
  "/",
  // userTypeMiddleware("Admin"),
  upload.fields([
    {
      name: "photos",
      maxCount: 30,
    },
    
    {
      name: "floorPlan",
      maxCount: 1,
    },
    
  ]),
  createProperty
);
propertyRouter.patch(
  "/",
  userTypeMiddleware("Admin"),
  upload.fields([
    {
      name: "photos",
      maxCount: 30,
    },
    {
      name: "floorPlan",
      maxCount: 1,
    },
  ]),
  updateProperty
);

propertyRouter.delete("/",userTypeMiddleware("Admin"),deleteProperty)

propertyRouter.get("/",getProperty)
propertyRouter.get("/propertyByID",userTypeMiddleware('customer'),getPropertyById)

propertyRouter.get('/availableProperty',availableProperty);


propertyRouter.post('/addToWishList',userTypeMiddleware('customer'),addPropertyToWishlist);
propertyRouter.post('/removeFromWishList',userTypeMiddleware('customer'),removePropertyFromWishlist);
propertyRouter.get('/propertyListInWishList',userTypeMiddleware('customer'),wishListProperty);

propertyRouter.get('/adminGetProperty',adminGetProperty)

export default propertyRouter;
