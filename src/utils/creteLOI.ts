import fs from 'fs';
import PDFDocument from 'pdfkit';
import { uploadPdfToS3, uploadSingleFile } from './s3-setup';
import { PassThrough, Readable } from 'stream';

export function generateHeader(doc, data) {
  doc.fontSize(8)
  const width = doc.page.width
  doc.image('xacco.png', width/2, 50, { width: 50 }, { align: 'center' });
  doc.strokeColor('black').stroke().fillColor("#444444").text('LETTER OF INTENT', 100, 100, { align: 'center' });
  doc.text('(Residential)', 100, 120, { align: 'center' });
  doc.moveDown();
  doc.text(`Date: ${data?.signedDate}`);
  doc.text(`SUBJECT TO CONTRACT,`, { align: 'right' });
  doc.moveDown();
  doc.text(`To: XACCO Global hospitalities Pte. Ltd. (UEN: 201723923D)`);
  doc.moveDown();
  doc.text(`Dear Sir/Ma'am,`);
  doc.moveDown();
  doc.text(`Property Known as: ${data?.details}`);
  doc.moveDown();
  doc.text(`We are pleased to inform you that we, ${data?.tenantName} & Co. have confirm our intention to lease the above-mentioned property based on the following terms and conditions:`);
  doc.moveDown();

  // Add terms and conditions
  doc.text(`1. Period of Lease / Monthly Rent`);
  doc.text(`The lease shall be for ${data?.month} Months at  ${data?.monthlyRent} per month, throughout the lease duration. For the month that is not full month, the rent will be pro-rated according to the days the Tenant stays (Monthly rent to be divided by 30 calendar days, multiplied by the number of days as per the lease)`);
  doc.moveDown();

  doc.text(`2. Date of Commencement`);
  doc.text(`The lease shall commence on ${data?.startDate}`);
  doc.moveDown();
  doc.text(`3. Terms of Payment`);
  doc.text(`One (1) month’s Security Deposit to be transferred upon the signing of this LOI`);
  doc.text(`1st month rent payable before ${data?.startDate} otherwise, apartment will be considered as available and the Security Deposit to be forfeited by Lessor`)
  doc.moveDown();

  doc.text(`4. ${data?.extraTopicHeading}`);
  doc.text(`To be borne by the Tenant throughout the duration of the lease.`);
  doc.moveDown();
  doc.text(`Utilities charges: Subject to usage by the Tenant (Lessor to send monthly invoice based on utilities consumption)`);
  doc.moveDown();
  doc.text(`${data?.extraTopicDetails}`);
  doc.moveDown();

  doc.text(`5.Option To Renew`)
  doc.text(`The Tenant shall have the option to renew the lease at the expiration by giving the Lessor written confirmation made not less than two (2) months before expiration at prevailing market rental rate to be mutually agreed upon thereon. Lessor shall have the final decision in the rental pricing and renewal of the lease after discussion.`)
  doc.moveDown();

  doc.text(`6.Minor Repair Clause`)
  doc.text(`Except for the first 7 days of the first arrival of the Tenant, Tenant shall be responsible for all minor repairs and
  replacement of parts and other expendable items at its own expense up to ${data?.repairUpto} per item or per repair. Such expenditure in excess of ${data?.repairUpto} per item shall be borne by the Lessor, provided prior consent has been sought from the Lessor and that any damage requiring such repair is not due to the negligence of the Tenant or its permitted occupiers.`)
  doc.moveDown();
  doc.text(`The first 7 days from the arrival of the first tenant will be considered as the Defects Free Period, where the Tenant
  is able to report defects that are not due to the negligence of the Tenant and the Lessor will rectify it at no cost.`)
  doc.moveDown();


  doc.text(`7.The following are a list of our requirements prior to handover:`)
  doc.text(`\t a. To ensure that the premises have been professionally cleaned and all appliances are working`)
  doc.text(`\t b. To ensure that all aircon units have been generally serviced before arrival`)
  doc.moveDown();

  doc.text(`8. After both the Tenant and the Lessor have signed the LOI, the Tenant shall make a good faith deposit in the amount of ${data?.monthlyRent} (“Good Faith Deposit”) to reserve the abovementioned property, into the following bank account:`)
  doc.moveDown();
  doc.text(`Account Holder Name: ${data?.accountHolderName}`)
  doc.text(`Bank: ${data?.bankName}`)
  doc.text(`Account Number: ${data?.accountNumber}`)
  doc.moveDown();

  doc.text(`This Good Faith Deposit shall be construed as payment towards the security deposit which shall be equivalent to
  one (1) month of rent. The first month of rent shall be paid before ${data?.startDate}, failure which this apartment will be
  deem to be available and the deposit will be forfeited by the Lessor.`)
  doc.moveDown();

  doc.text(`The security deposit shall be refunded to the Tenants at the expiry of the Tenancy Agreement, in which a Deposit Refund Summary will be shared with the Tenants within 45 calendar days from the expiry of the Tenancy Agreement. After obtaining full consensus from the Tenants, the security deposit will be refunded back to the Tenants’ requested bank account immediately without delays.`)
  doc.moveDown();

  doc.text(`9.The Tenancy Agreement must be finalized and signed between the Lessor and the Tenant within fourteen (14) days from the date of Acceptance by the Lessor for the LOI or one (1) day before commencement, whichever is earlier`)
  doc.moveDown();

  doc.text(`10. If the Tenant and the Lessor cannot agree with the terms & conditions of the Tenancy Agreement (in writing, email sufficient), or cannot reach an agreement to jointly approve amendments to the Tenancy Agreement (in writing, email sufficient), then the deposit should be returned to the Tenant in full, if it is not to the fault of the Tenant`)
  doc.moveDown();

  doc.text(`11. If the Tenant withdraws the offer or fails to sign the Tenancy Agreement after the terms & conditions of the Tenancy Agreement are already agreed (subject to clause 10), the Lessor shall be at liberty to rent the above premises to another tenant and the good-faith deposit submitted herewith shall be forfeited to the Lessor without further notice to the Tenant and this Letter of Intent shall become null and void.`)
  doc.moveDown();
  //Signature
  doc.moveDown();
  doc.text(`Yours faithfully,`);
  doc.text(`${data?.tenantName} (${data?.tenantPassport})`);
  doc.moveDown();

  // Add tenant confirmation section
  doc.text(`***************************************************************************************************`);
  doc.text(`Confirmation by Tenant:`);
  doc.moveDown();
  doc.font('customFont.ttf').fontSize(20)
    .text(`${data?.tenantName}`)
  doc.text(`_____________________________________`);
  doc.font('Times-Roman').fontSize(8)
  doc.text(`Signature`);
  doc.text(`Name: ${data?.tenantName}`);
  doc.text(`Date: ${data?.signedDate}`);
  doc.text(`Public IP: ${data?.ipAddress}`);
  doc.text(`Passport No.: ${data?.tenantPassport}`);
  doc.text(`Other Tenants in group:`);
  data?.otherTenant?.map((item) => {
    doc.text(`${item.name} (${item.passport})`);

  })

  doc.moveDown();
  doc.text(`***************************************************************************************************`);
  doc.text(`Accepted by Lessor:`);

  const imageWidth = 50;
  const imageHeight = imageWidth * (96 / 72); // Maintain aspect ratio
  doc.image('xacco.png', {
    relativePosition: {
      x: 0, // Left edge
      y: doc.page.height - imageHeight, // Bottom edge
    },
    width: imageWidth,
  });
  doc.moveDown(5);
  // doc.moveUp(imageHeight + 10); // Move the text above the image
  doc.text('XACCO Global hospitalities Pte. Ltd.');
  doc.text('UEN: 201723923D');
  doc.moveDown();

  doc.text('Confirmation by Witness:');
  doc.text(`_____________________________________`);


}

// Pipe the PDF into a writable stream
export const pdfGenrator = async (data) => {
  const passThrough = new PassThrough();
  const doc = new PDFDocument();
  doc.pipe(passThrough);
  generateHeader(doc, data);
  doc.end();

  try {
    const url = await uploadPdfToS3(passThrough, 'letter-of-intent.pdf');
    console.log('File URL:', url);
    return url;
  } catch (error) {
    console.error('Error uploading file:', error);
  }
};
