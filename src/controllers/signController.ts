import { Request, Response } from "express";
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';


const accessToken = '1000.71b2fc8bc602c5e76d51da81496056c9.3e1734dfa9ce2ec0ba0c6317a6870419';

// API endpoint to send a document for signing
export const sendDocumet = async (req: Request, res: Response) => {
  try {
    // const recipientEmails = req.body.emails;
    // const filePath = 'C:\\Users\\shubh\\OneDrive\\Desktop\\MoshiMoshi\\zaco\\xaaco-backend\\xacco-backend\\src\\utils\\Shubham.pdf';

    // const requestJson = {
    //   'request_name': 'testDoc',
    //   'expiration_days': 10,
    //   'is_sequential': true,
    //   'notes': "Sign the document"
    // };

    // const data = { 'requests': requestJson };

    // const payload = new FormData();
    // payload.append('data', JSON.stringify(data));

    // if (fs.existsSync(filePath)) {
    //   const fileStream = fs.createReadStream(filePath);
    //   payload.append('file', fileStream);
    // } else {
    //   return res.status(400).json({ error: 'Unable to read file' });
    // }

    // const headers = {
    //   'Authorization': `Zoho-oauthtoken${accessToken}`
    // };

    // const requestOptions = {
    //   method: 'POST',
    //   headers,
    //   body: payload
    // };

    // const response = await fetch('https://sign.zoho.com/api/v1/requests', requestOptions);
    // const responseJson = await response.json();
    // console.log(response)
    // if (response.ok) {
    //   const requestId = responseJson.requests.request_id;

    //   // Step 2 - Request Submission (Sending document to recipients)
    //   const actions = recipientEmails.map((email, index) => ({
    //     'verify_recipient': false,
    //     'recipient_name': `Recipient ${index + 1}`,
    //     'recipient_email': email,
    //     'action_type': "SIGN",
    //     'signing_order': index
    //   }));

    //   const requestJson = { 'actions': actions };
    //   const data = { 'requests': requestJson };
    //   const payload = new FormData();
    //   payload.append('data', JSON.stringify(data));
    //   if (fs.existsSync(filePath)) {
    //     payload.append('file', fs.createReadStream(filePath));
    //   } else {
    //     return res.status(400).json({ error: 'Unable to read file' });
    //   }

    //   const requestOptions = {
    //     method: 'POST',
    //     headers,
    //     body: payload
    //   };

    //   const response = await fetch(`https://sign.zoho.com/api/v1/requests/${requestId}/submit`, requestOptions);
    //   const responseData = await response.json();

    //   if (response.ok) {
    //     res.json({ message: 'Document sent for signing', requestId: requestId });
    //   } else {
    //     res.status(400).json({ error: 'Failed to submit the request' });
    //   }
    // } else {
      res.status(400).json({ error: 'Failed to create the request' });
    // }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

