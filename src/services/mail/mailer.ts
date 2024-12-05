// import nodemailer from 'nodemailer';

// export const sendEmail = async (to, subject, text) => {
//     try {
//         const transporter = nodemailer.createTransport({
//             host: process.env.HOST_MAILER,
//             port: process.env.PORT_MAILER,
//             secure: false, // true for 465, false for other ports
//             auth: {
//                 user: process.env.USER_MAILER,
//                 pass: process.env.PASS_MAILER
//             }
//         });

//         // send mail with defined transport object
//         let info = await transporter.sendMail({
//             from: '"Sender Name" <sender@example.com>', // sender address
//             to: to, // list of receivers
//             subject: subject, // Subject line
//             text: text, // plain text body
//         });

//         console.log("Message sent: %s", info.messageId);
//         return info.messageId;
//     } catch (error) {
//         console.error("Error occurred while sending email:", error.message);
//         throw error;
//     }
// };
