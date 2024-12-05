import { Request, Response } from 'express';
import { Admin } from '../models/admin.Schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const secretKey:string = process.env.JWT_SECRET||"";
const salt:number = parseInt(process.env.SALT_ROUND||"10");





export const adminSignUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const hashedPassword=await bcrypt.hash(password,salt);    
    const newUser = await Admin.create({
      email,
      password:hashedPassword,
    });

    const token = jwt.sign({user:newUser,userType:"Admin"},secretKey,{
      expiresIn:'30d'
    })

  const refreshToken = jwt.sign({user:newUser,userType:"Admin"},secretKey,{
    expiresIn:'30d'
  })

    res.set('x-access-token',token)
    res.set('x-refresh-token',refreshToken)
    res.set("Access-Control-Expose-Headers", [
      "x-access-token",
      "x-refresh-token"
    ]);
    
    res.status(201).json({status:true});
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error, });
  }
};
 
export const adminLogin = async (req:Request,res:Response):Promise<void> =>{
  try {
    const {email,password} = req.body;
    const user = await Admin.findOne({
        where:{
          email
        }
    })
    if(!user)
    {
      res.status(401).json({message:"User Does not exist"})
    }
    else
    {
      const passwordMatch =await bcrypt.compare(password,user.password)      
      if(!passwordMatch)
      {
        res.status(401).json({message:"Password does not matched"})
      }
      else
      {
        const token = jwt.sign({user:user,userType:"Admin"},secretKey,{
          expiresIn:'30d'
        })
    
        const refreshToken = jwt.sign({user:user,userType:"Admin"},secretKey,{
            expiresIn:'30d'
        })
    
        res.set('x-access-token',token)
        res.set('x-refresh-token',refreshToken)
        res.set("Access-Control-Expose-Headers", [
          "x-access-token",
          "x-refresh-token"
        ]);
        
        res.status(201).json({status:true});
      }

    }
  } catch (error) {
    res.status(500).json({error:error})
  }
}