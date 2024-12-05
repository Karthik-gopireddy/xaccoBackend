import { Request, Response } from 'express';
import { User } from '../models/users.Schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Verifiaction } from '../models/verification.Schema';
import nodemailer from 'nodemailer';
import { createTransport, SentMessageInfo } from 'nodemailer';
import { error } from 'console';

// require("dotenv").config();
   // <a href="https://xacco-backend.moshimoshi.cloud/users/verifyUser?code=${randomString}">



  // host: "smtp.gmail.com",



const transporter = nodemailer.createTransport({

  service: 'gmail',
  port: 465,
  // secureConnection:false,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: "mail@xacco.co",
    // pass: "spignhnghjiqiruu",
    pass: "rwLEX_xsqZi8nNm",
  },
  
});





const secretKey: string = process.env.JWT_SECRET || '';
const salt: number = parseInt(process.env.SALT_ROUND || '10');

// Define a custom Request type that includes the 'user' property
interface CustomRequest extends Request {
  user?: {
    [key: string]: unknown;
  };
}

function generateRandomString(length: number): string {
  const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result: string = '';
  const charactersLength: number = characters.length;
  for (let i: number = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}




export const updatePassword = async (req:Request,res:Response) =>{
  try {
    const {email,currentPassword,newPassword} = req.body
    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      res.status(401).json({ message: 'User Does not exist' });
    } 
    else if(user.status == 'unverified')
    {
      res.status(401).json({ message: 'Email is unverifed' });
    }
    
    else {
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      console.log(passwordMatch, 'Match');
      if (!passwordMatch) {
        res.status(401).json({ message: 'Password does not match' });
      } else {
        const hashedPassword = await bcrypt.hash(newPassword, salt);

       await User.update({
          password:hashedPassword
        },{
          where:{email:email}
        })


        res.status(200).json({ message:'Password Updated Successfully' });
      }
    }

  } catch (error) {
    res.status(500).json({message:error})
  }
}





export const sendVerificationLink= async (req:Request,res:Response) => {
  try {
    const {email} = req.body
    const user = await User.findOne({
      where:{email:email}
    })
    if(!user)
    {
      res.status(400).json({message:'No Account associated with this email'})
    }
    else 
    {
      if(user.status=='verfied')
      {
       return res.status(400).json({message:'Account already verified please login'})
      }
      let randomString: string ;
      let list:Verifiaction;
      do
      {
        randomString  = generateRandomString(50);
         list =await Verifiaction.findOne({
          where:{code:randomString}
        })
        
      }
      while(list)      
    const verificationRow = await Verifiaction.findOne({
      where:{email:email}
    })
      if(!verificationRow)
      {
        await Verifiaction.create({
          email:email,
          code:randomString
        })
      }
      else
      {
        await Verifiaction.update({
          code:randomString
        },{
          where:{email:email}
        })
      }
    
  
      const mailOptions = {
        // from: 'shubhamppt1170@outlook.com',
        from:"mail@xacco.co",
        to: email,
        subject: 'Verify Your Account ',
        text: 'This email contains encrypted link and is valid for 10 min only',
        html: `
        <strong>This is the HTML version of the email.</strong>
        <a href="http://localhost:7072/users/verifyUser?code=${randomString}">Verify your account</a>
      `,
        };



      transporter.sendMail(mailOptions, (error: Error | null, info: SentMessageInfo) => {
        if (error) {
          console.log(`Error sending email: ${error.message}`)
          res.status(500).json({message:"Error while sending verification link"})
          // throw new Err(`Error sending email: ${error.message}`)
        } else {
          console.log(`Email sent: ${info.response}`);
        }
      });
      
    }
   
  } catch (error) {
    console.log(error)
    res.status(500).json({message:'Error while sending verification code'})
  }
}





export const sendTest= async (req:Request,res:Response) => {
  const {email} = req.body
  try {   
    let randomString: string ;
    let list:Verifiaction;
    do
    {
      randomString  = generateRandomString(50);
       list =await Verifiaction.findOne({
        where:{code:randomString}
      })
      
    }
    while(list)
    const mailOptions = {
      // from: 'mail@xacco.co',
      from: 'mail@xacco.co',
      to: email,
      subject: 'Verify Your Account ',
      text: 'This email contains encrypted link and is valid for 10 min only',
      html: `
      <strong>This is the HTML version of the email.</strong>
       <a href=http://localhost:7072/users/verifyUser?code=${randomString}">Verify your account</a>
    `,
      };
    transporter.sendMail(mailOptions, (error: Error | null, info: SentMessageInfo) => {
      if (error) {
        console.log(`Error sending email: ${error.message}`)
        res.status(500).json({message:"Error while sending verification link"})
        // throw new Err(`Error sending email: ${error.message}`)
      } else {
        console.log(`Email sent: ${info.response}`);
      }
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({message:'Error while sending verification code'})
  }
}







export const UserSignUp = async (req: CustomRequest, res: Response): Promise<void> => {
  try {

   
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword, 'Password');
    await User.create({
      name,
      email,
      password: hashedPassword,
      status:'unverified' // change this to unverified once email start working 
      
    });

   
    let randomString: string ;
    let list:Verifiaction;
    do
    {
      randomString  = generateRandomString(50);
       list =await Verifiaction.findOne({
        where:{code:randomString}
      })
      
    }
    while(list)
    console.log(randomString)
    
  await Verifiaction.create({
      email:email,
      code:randomString
    })

    const mailOptions = {
      from: 'mail@xacco.co',
      to: email,
      subject: 'Verify Your Account',
      text: 'This email contains an encrypted link and is valid for 10 min only.',
      html: `
        <div>
          <p><strong>This email contains an encrypted link and is valid for 10 min only.</strong></p>
          <p>
  
             <a href="http://localhost:7072/users/verifyUser?code=${randomString}">
              Verify your account
            </a>
          </p>
        </div>
      `,
    };
    
    transporter.sendMail(mailOptions, (error: Error | null, info: SentMessageInfo) => {
      if (error) {
        console.error(`Error sending email: ${error.message}`);
      } else {
        console.log(`Email sent: ${info.response}`);
      }
    });
  

    res.status(201).json({ status: true });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error });
  }
};

export const verifyUser = async(req:Request,res:Response) =>{
  try {
    const {code} = req.query;
    const userVerification = await Verifiaction.findOne({
     where:{ code:code}
    })
    const time = new Date();
    if (!userVerification) {
        return res.status(400).send('<p>Link Is Broken</p>');
    } else {
        const updatedAtTime = new Date(userVerification.updatedAt).getTime();
        const currentTime = time.getTime();
        const timeDifference = currentTime - updatedAtTime;
        
        // 10 minutes in milliseconds
        const tenMinutesInMillis = 10 * 60 * 1000;
    
        if (timeDifference > tenMinutesInMillis) {
            return res.status(400).send('<p>Link Expired</p>');
        }
        else 
        {
          await User.update({
            status:'verified'
          },{
            where:{email:userVerification.email}
          })
          await userVerification.destroy();
          return res.status(400).send('<p>Email Successfully Verified , Please Login </p>');

        }
    }
  } catch (error) {
     console.log(error)
      res.status(500).json({message:'Error while verifying user'})
  }
}

export const userLogin = async (req: CustomRequest, res: Response): Promise<void> => {
  try {    
    const { email, password } = req.body;
    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      res.status(401).json({ message: 'User Does not exist' });
    } 
    else if(user.status == 'unverified')
    {
      res.status(401).json({ message: 'Email is unverifed' });
    }
    
    else {
      const passwordMatch = await bcrypt.compare(password, user.password);      
      if (!passwordMatch) {
        res.status(401).json({ message: 'Password does not match' });
      } else {
        const token = jwt.sign({ user: user,userType:"customer" }, secretKey, {
          expiresIn: '30d',
        });

        const refreshToken = jwt.sign({ user: user,userType:"customer" }, secretKey, {
          expiresIn: '30d',
        });

        res.set('x-access-token', token);
        res.set('x-refresh-token', refreshToken);
        res.set('Access-Control-Expose-Headers', ['x-access-token', 'x-refresh-token']);

        res.status(200).json({ status: true,user:user });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const getUserDetails = async(req:Request,res:Response):Promise<void> =>{
  try {

  } catch (err) {

     res.status(500).json({ error: "Internal Server Error" });
  }
}

export const sendEmail =async(email,subject,text,htmldata)=>{
  const mailOptions = {
    // from: 'mail@xacco.co',
    from: 'mail@xacco.co',
    to: email,
    subject: subject,
    text: text,
    html: htmldata,
    };
  transporter.sendMail(mailOptions, (error: Error | null, info: SentMessageInfo) => {
    if (error) {
      console.log(`Error sending email: ${error.message}`)
      return ;
      // throw new Err(`Error sending email: ${error.message}`)
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
}

