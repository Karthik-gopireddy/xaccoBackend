import { Request, Response } from 'express';
import multer from 'multer'; 
import { uploadSingleFile } from './s3-setup';
import { singaporeContractGenerator } from './createSingaporeContract';


const storage = multer.memoryStorage()
const upload= multer({storage:storage});

const uploadSingleImage =  async (req: Request, res: Response) => {
    new Promise((resolve, reject) => {
      upload.single('image')(req, res, (err: any) => {
        if (err) {
          return reject(err); 
        }
        if (!req.file) {
          return reject(new Error('No file uploaded')); 
        }
        resolve(req.file); 
      });
    })
    .then(async (file: any) => {
      const img = await uploadSingleFile(file); 
      return res.status(200).json({ message: 'File uploaded successfully', path:img });
    })
    .catch((error: any) => {
      return res.status(500).json({ error: error.message }); 
    });
  };
  
const generateLOi = async(req:Request,res:Response)=>{
  try {
    singaporeContractGenerator({
      signedDate:'12 Dec 2024',
      tenantName:'Shubham Kumar',
      ipAddress:'122.23.23.32',
      tenantPassport:'12SEDF123',
      otherTenant:[{name:'Shubham',passport:'232SCS123232',email:'abc@gmail.com'},
      {name:'Gopi',passport:'232SCS123232',email:'bcd@gmail.com'}
      ,{name:'Kashi',passport:'232SCS123232',email:'cde@gmail.com'}]
    });
    res.status(200).json({msg:'Pdf generated'})
  } catch (error) {
    console.log(error)
    res.status(500).json({msg:'Pdf Not generated'})
  }
}

export { uploadSingleImage,generateLOi };
