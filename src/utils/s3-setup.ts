import aws, { S3 } from 'aws-sdk';
import dotenv from 'dotenv';
import { PassThrough } from 'stream';

dotenv.config();
aws.config.setPromisesDependency(Promise);

console.log(process.env.AWS_ACCESS_KEY_ID,process.env.AWS_REGION,process.env.S3_BUCKET_NAME,"AWS  CRED")
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

interface S3File {
  buffer: Buffer;
  originalname: string;
}

const formS3Params = (file: S3File) => ({
  Bucket: 'xacco',
  Body: file.buffer,
  Key: `${file.originalname}/${Date.now()}-${file.originalname}`,
});

export const uploadSingleFile = async (file: S3File): Promise<string> =>
  new Promise((resolve, reject) => {

    if (!file) {
      return resolve("");
    }

    const s3 = new S3();
    const params = formS3Params(file);

    s3.upload(params, (err: Error | null, data: S3.ManagedUpload.SendData) => {
      if (err) {
        console.log("Error occurred while trying to upload to S3 bucket", err);
        return reject(err);
      }
    //   console.log(data.Location)
      return resolve(data.Location);
    });
  });

  export const uploadPdfToS3 = async (pdfStream: PassThrough, fileName: string): Promise<string> => {
    const uploadParams = {
      Bucket: 'xacco',
      Body: pdfStream,
      Key: `${fileName}/${Date.now()}-${fileName}`,
    };
  
    return new Promise((resolve, reject) => {
      const s3 = new S3()
      s3.upload(uploadParams, (err: Error | null, data: S3.ManagedUpload.SendData) => {
        if (err) {
          console.log('Error occurred while trying to upload PDF to S3 bucket', err);
          return reject(err);
        }
  
        return resolve(data.Location);
      });
    });
  };
