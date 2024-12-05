import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// import passport from 'passport';

const secretKey = process.env.JWT_SECRET || "";

interface DecodedToken {
  userType?: string;
  // Add other properties from your JWT payload as needed
}

interface CustomRequest extends Request {
  user?: {
    // Define the structure of your user object here
    [key: string]: unknown;
  };
}

export const userTypeMiddleware = (requiredUserType: string) => async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const accessToken = req.header('x-access-token');
    const refreshToken = req.header('x-refresh-token');
    
    if (!accessToken && !refreshToken) {
      console.log(req.path,"Path")
      if(req.path.startsWith('/propertyByID'))
      {
     
        next();
      }
      else
      {
        
        res.status(401).json({ message: 'Access denied. Tokens not provided.' });
        return;
      }
      
    }

    const verifyToken = (token: string) => {
      return new Promise<DecodedToken>((resolve, reject) => {
        jwt.verify(token, secretKey, (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded as DecodedToken);
          }
        });
      });
    };
   


    const handleTokenVerification = async (token: string, isRefreshToken: boolean = false) => {
      try {
        const decoded = await verifyToken(token);

        // Check if the user type in the token matches the required user type
        if (typeof decoded.userType !== 'string' || decoded.userType !== requiredUserType) {
          res.status(401).json({ message: 'Unauthorized. User does not have the required user type.' });
          return;
        }

        req.user = decoded as CustomRequest['user']; // Set decoded user information directly on req object
        next();
      } catch (error) {
        if (isRefreshToken) {
          res.status(401).json({ message: 'Invalid refresh token.' });
        } else {
          res.status(401).json({ message: 'Invalid access token.' });
        }
      }
    };

    if (accessToken) {
      await handleTokenVerification(accessToken);
    } else if (refreshToken) {
      await handleTokenVerification(refreshToken, true);
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};




// export const googleAuthController = passport.authenticate('google', {
//   session: false,
//   scope: ['profile', 'email'],
// });

// export const googleAuthCallbackController = (req: Request, res: Response, next: NextFunction) => {
//   passport.authenticate('google', { session: false }, (err, user) => {
//     if (err || !user) {
//       return res.status(401).json({ message: 'Authentication failed' });
//     }
//  return res.send("hello world")
//     // Generate a JWT token
//     const token = jwt.sign({ user }, secretKey, { expiresIn: '1d' });
//     return res.json({ token });
//   })(req, res, next);
// };

// export const ensureAuthenticated = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {

//   const token = req.header('Authorization')?.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ message: 'Unauthorized' });
//   }

//   try {
//     const decoded = jwt.verify(token, 'your_secret_key');
//     // req.user = decoded.user;
//     return res.send("hello world")
//     return next();

//   } catch (error) {
//     return res.status(401).json({ message: 'Unauthorized' });
//   }
// };