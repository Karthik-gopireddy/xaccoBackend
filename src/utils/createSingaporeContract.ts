import fs from 'fs';
import PDFDocument from 'pdfkit';
import { uploadPdfToS3 } from './s3-setup';
import { PassThrough } from 'stream';

function generateTableRow(
    doc,
    index,
    name,
    passport, y
) {
    doc
        .fontSize(10)
        .text(index, 80, y, { width: 70, align: "center" })
        .text(name, 150, y, { width: 50, align: "center" })
        .text(`PASS NO: ${passport} `, 200, y, { align: "center" })
    // .text(lineTotal, 400, y, { align: "right" });
}
function generateInvoiceTable(doc, tenant) {
    let i;
    const invoiceTableTop = 260;

    doc.font("Helvetica-Bold");


    for (i = 0; i < tenant.length; i++) {
        const position = invoiceTableTop + (i + 1) * 30;

        generateTableRow(
            doc,
            i + 1,
            tenant[i].name,
            tenant[i].passport,
            position
            // formatCurrency(69),
        );

    }
}
function generateClauseRow(
    doc,
    index,
    heading,
    details, y
) {
    let p=doc.y
    doc
        .fontSize(8)
        .text(`${heading} `, 450,doc.y, p,{align:'right'})
        .text(index, 30,doc.y, { width: 10 })
        .text(details, 50, doc.y,{widht:300,align:'left'})
    doc.moveDown()
    doc.moveDown()
    doc.moveDown()
    // .text(lineTotal, 400, y, { align: "right" });
}
function generateClauseTable(doc, tenant,tabletop) {
    let i;
    const invoiceTableTop = tabletop;

    for (i = 0; i < tenant.length; i++) {

        generateClauseRow(
            doc,
            tenant[i].ind,
            tenant[i].heading,
            tenant[i].details,
            doc.y
        );

    }
}
export function generateHeader(doc, data) {
    doc.fontSize(8)
    const width = doc.page.width
    doc.image('xacco.png', width / 2, 50, { width: 50 }, { align: 'center' });
    doc.strokeColor('black').stroke().fillColor("#444444").text('Tenancy Agreement (Whole Unit)', 100, 100, { align: 'center' });
    doc.text('This Agreement is made on', 100, 120, { align: 'center' });
    doc.text(`${data?.signedDate}`, 100, 140, { align: 'center' });
    doc.text(`BETWEEN`, 100, 160, { align: 'center' });
    doc.text(`XACCO Global hospitalities Pte. Ltd.`, 100, 180, { align: 'center' });
    doc.text(`Address: 1 COLEMAN STREET #10-06 THE ADELPHI SINGAPORE 179803`, 100, 200, { align: 'center' });
    doc.text(`Company UEN: 201723923D`, 100, 220, { align: 'center' });
    doc.text(`(Hereinafter referred to as "the Lessor")`, 100, 240, { align: 'center' });
    doc.text(`AND`, 100, 260, { align: 'center' });
    doc.moveDown();

    generateInvoiceTable(doc, data?.otherTenant)


    // Draw the table with bold content and no border
    doc.font('Times-Roman'); // Reset the font to normal
    doc.fontSize(8)
    doc.moveDown()
    doc.moveDown()
    doc.text(`(Hereinafter referred to as "the Tenant/s")`, { align: 'centre' })
    doc.text(`WHEREBY IT IS AGREED as follows:`)
    doc.text(``, 30, 400, { align: 'center' });
    doc.moveDown()
    doc.text(`1. The Lessor shall grant to the Tenant a tenancy of all that property known as ${data?.details} (hereinafter called the "Premeses") together with furniture,fixtures,appliances, and fittings ( Collectively referred to as the Chattels) therein belonging to the Lessor to hold unto the Tenant for a term of ${data?.months} months from the ${data?.startDate} and ending on the ${data?.endDate} (the "Term") at a calender monthly rent in the sum of ${data?.monthlyrent} (referred to as "Rent").`)

    doc.text(`2.The first payment of rent is payable on the signing of this Tenancy Agreement and the subsequent payment of rent is payable monthly in advance without deduction whatsoever by the 25th of the previous calendar month (e.g. for rental payment for May 2023, the payment should be paid by the 18th of Apr 2023 and it must reach the Lessor by the 25th Apr 2023)`)

    doc.text(`3.The Tenant shall also pay to the Lessor, a deposit of ${data?.monthlyrent} (referred to as "the Deposit") at the signing of this Tenancy Agreement along with the rent for the first month. If the deposit has already been paid, only the first month rent is payable`)

    doc.moveDown()
    doc.text(`4.The TENANT hereby agrees with the LESSOR as follows:`)
    doc.text(`All payments of rent and deposit shall be made by a transfer to the account of the Lessor ${data?.accountHolderName} at ${data?.bankName} Account number ${data?.accountNumber}.`)

    const FourhClausedata = [
        {
            ind: 'a',
            heading: 'PAYMENT OF RENT',
            details: `To pay the Rent at the time and in the manner provided in Clause 2 above without any deduction, counterclaim, legal or equitable set-off. For the purpose of calculating rent, a calendar month will be considered from the 1 st day of each month to the last day of the month. In the event of the Tenant renting out the premises from a date other than the first day of the month, the pro rata adjustment will be made in the rent of the subsequent month. Pro-rata payment shall be adjusted based on 30 calendar days, regardless of how many days are in the month.`
        },
        {
            ind: 'b',
            heading: '',
            details: `It shall be the responsibility of the Tenant to ensure that rent is credited to the account of the Lessor before the last day of the month in case the payment is being made by a wire transfer or any other overseas bank account.`
        },
        {
            ind: 'c',
            heading: 'SECURITY DEPOSIT',
            details: `To deposit and maintain with the Lessor the sum of ${data?.monthlyRent} (the "Security Deposit") observance and performance by the Tenant of all of the Tenant's obligations under this Agreement. The Security Deposit or any part of it may be applied by the Lessor in or towards the payment of any sums due to the Lessor under this Agreement. Subject as provided above, the Deposit Refund Summary shall be sent to the Tenant within forty-five (45) days after the expiration of the Term (The Lessor will share a Deposit Refund Summary with the Tenant within forty-five days and the deposit shall be transferred to the Tenant after the consensus has been obtained by the Tenant and Lessor on the amount to be transferred.) No part of the Security Deposit shall, without the written consent of the Lessor, be used by the Tenant to offset against any Rent or other sums owed by the Tenant.`
        },
        {
            ind: 'd',
            heading: '',
            details: `To keep the interior of the Premises including the drains, water heaters, sanitary and water apparatus, air-conditioning units, doors, windows, furniture, and equipment thereof in good and Tenantable repair and condition throughout the Term (fair wear and tear and damage by fire, lightning, flood and any Act of God or cause not attributable to the neglect or default of the Tenant, its servants, employees or permitted occupiers excepted.)`
        },
        {
            ind: 'e',
            heading: 'COMPLIANCE WITH RULES AND REGULATIONS',
            details: `To ensure that at all times during the Term that the Tenant and/or permitted occupants are incompliance with all the rules and regulations relating to the Immigration Act (Chapter 133) andthe Employment of Foreign Manpower Act (Chapter 91A) (if applicable) any other law in theRepublic of Singapore which relates to foreign residents. The Tenant declares that they havevalid travel documents, visas, work permits, or proof of legality of stay in Singapore. Thisagreement is subject to the validity of the documents verified by the Lessor. The Tenant mustsubmit a copy of the documents to the Lessor. If a Tenant furnishes false documents, thisagreement will automatically be deemed canceled and any deposit made by the Tenant will beforfeited.`
        },
        {
            ind: 'f',
            heading: 'UTILITY ALLOWANCE AND INTERNET FACILITIES',
            details: `To pay the utility charges subject to the following conditions:For ease and convenience to the Tenant, the Lessor is offering to set up the utility andinternet connection for the Tenant.
        (i) The Lessor will send an invoice for the monthly utilities consumption amount and the Tenant agrees to pay the amount along with the next due rent payable. The Lessor will also send a monthly invoice for internet connection on the premises to be paid along with the utilities; however, the Lessor shall not be responsible or liable for any technical failure or any disruption of services from the service provider.
        (ii) Internet charges shall be at S$ 60.00 per month`
        },
        {
            ind: 'g',
            heading: 'ALTERATIONS AND ADDITIONS',
            details: `Not to make any alterations or additions to the Premises or to any fixtures or fittings therein (including without limitation, any of the Chattels) or to bore or hack any holes or drive any nails into the walls or ceiling of the Premises (except anything reasonably done to hang paintings, posters, and ornaments) without the prior written consent of the Lessor. If such consent is given, the Tenant shall at its own expense restore the Premises to its original state and condition upon the expiration or sooner determination of the Term, less fair wear and tear in the Premises caused by the Tenant or a permitted occupier. In case the Tenant is unable to get the said repairs done due to paucity of time or any other reason, the Lessor can facilitate the repair work, the cost of which shall be borne by the Tenant`
        },
        {
            ind: 'h',
            heading: 'LOSS OF ITEMS (CHATTELS)',
            details: `To keep all the items included in the inventory list (which shall be provided to the Tenant within one week of moving into the apartment) in a good state (fair wear and tear excepted) and not to remove, sell or dispose of any inventoried item. If any items are lost or damaged, compensate the Lessor the costs (as reasonably determined by the Lessor) of the repair or replacement incurred or to be incurred in respect of such repair or replacement`
        },
        {
            ind: 'i',
            heading: `TENANTABLE REPAIR & MINOR REPAIR CLAUSE`,
            details: `To replace, at the Tenant's own expenses,any  non-working light bulbs, tubes and otherlighting forms. For any other fixtures or fittings belonging to the premises which are found to be broken or damaged during the Tenant's stay and were not reported by the Tenant during the defects free period, the Tenant shall bear the initial cost of ${data?.repairUpto} per item or per repair, while any excess will be borne by the Lessor.`
        },
        {
            ind: '',
            heading: ``,
            details: `The Lessor will also have the final say in deciding what constitutes an item or a repair, in the event that there is any disagreement in the repair or replacement works, and the Lessor reserves the right to engage their own appointed contractor, and the cost of repair up to the minor repair clause cost per item or per repair shall be borne by the Tenant.`
        },
        {
            ind: 'j',
            heading: `ACCESS TO THE PREMISE`,
            details: `To permit the Lessor and its agents, surveyors, and workmen with all necessary appliances to enter upon the Premises at all reasonable times by prior appointment for the purpose whether of viewing the condition thereof or of doing such works and things as may be required for any repairs, alterations or improvements whether of the Premises or of any parts of any building to which the Premises may form a part of or adjoin. To permit viewing at all reasonable times by prior appointment to enter the Premises for the purpose of taking a new Tenant or if the owner wants to sell the Premises. The Lessor will send their representative to enter and inspect the apartment once a month if required by the Lessor.`
        },

        {
            ind: 'k',
            heading: `LATE FEE`,
            details: `To pay a late fee for any delay in the payment of monthly rental to the Lessor. In addition, and without prejudice to any other right, power, or remedy of the Lessor, if the Rent or any part of it or any other sum payable by the Tenant to the Lessor remains unpaid. This fee of S$10.00 per room (Ten Only) per day shall be payable after the expiry of the 5-day grace period provided to the Tenant to pay the rent (from the 25th day to the last day of the month prior to the month for which the rent is due and is being paid). The delay shall be calculated from the day on which such sum falls due for payment, to the date on which such sum is paid to or recovered by the Lessor (credited to the account of the Lessor). The Lessor may recover the late fee with a separate invoice sent to the Tenant as if the late fee were rent in arrears`
        },
        {
            ind: 'l',
            heading: `PETS`,
            details: `Not to keep, or bring onto, the Premises or any part thereof, any pet(s) or bird(s) legally permitted to be pets without the prior written permission of the Lessor and to comply with any conditions imposed by the Lessor in the event of such permission being granted.`
        },
        {
            ind: 'm',
            heading: `DANGEROUS OR EXPLOSIVE MATERIALS`,
            details: `Not to keep in the Premises any materials of a dangerous or explosive nature, the keeping of which may contravene and/or breach any local statute or regulation.`
        },
        {
            ind: 'o',
            heading: `NO SMOKING`,
            details: `To not smoke in the said premises.`
        },
        {
            ind: 'p',
            heading: `USE OF PREMISES`,
            details: `To use the Premises strictly as a private residence only and not to do or permit to be done upon the Premises any act or thing which may be or may become a nuisance or annoyance to or in any way interfere with the quiet or comfort of any other adjoining occupiers or to give reasonable cause for complaint from the occupants of neighboring premises and not to use the Premises for any activity which is unlawful, illegal, not permitted by law, or immoral`
        },
        {
            ind: 'q',
            heading: `SUBLETTING AND ASSIGNMENT`,
            details: `Not to assign, sublet or otherwise part with or share the actual or legal possession or the use of the Premises without prior approval of the Lessor`
        },
        {
            ind: 'r',
            heading: `To indemnify the Lessor against`,
            details: ``
        },
        {
            ind: '',
            heading: `INDEMNITY`,
            details: `(i) All claims, damages, costs, losses, and expenses of any nature whatsoever which the Lessor may suffer or incur in connection with loss of life, personal injury, and/or damage or loss to property arising from any occurrence in upon or at the Premises or the use of the Premises or the Building or the facilities therein by the Tenant or a permitted occupier; unless the such loss of life, personal injury and/or damage or loss of property is caused by the willful default or gross negligence of the Lessor, its agents or servants, and`
        },
        {
            ind: '',
            heading: ``,
            details: `(ii) All loss and damage to the Premises and the Building and to all property in the Premises and the Building caused directly or indirectly by the Tenant or by a permitted occupier, and in particular but without limiting the generality of the foregoing, caused directly or indirectly by the use or misuse of water, gas or electricity.`
        },
        {
            ind: 's',
            heading: `COMPLIANCE TO RULES OF THE BUILDING`,
            details: `At all times during the Term to comply with all rules and regulations as may from time to time be prescribed by the Lessor and/or the Management Corporation for the use, maintenance, and security of the Building and the facilities therein.`
        },
        {
            ind: 't',
            heading: `NOTICE OF DAMAGE`,
            details: `To notify the Lessor immediately of any damage to the Premises or to any fixtures and fittings therein (including without limitation, any of the Chattels) and of any notice received from any government authorities or condo management relating to the Premises`
        },
        {
            ind: 'u',
            heading: `YIELD UP PREMISES AND CHATTELS`,
            details: `To peacefully and quietly yield up the Premises, with all fittings, fixtures, furniture (whereapplicable), and air-conditioning units at the expiration or sooner determination of the Termin such like condition as if the same were delivered to the Tenant at the commencement ofthis tenancy (fair wear and tear excepted)`
        },
        {
            ind: 'v',
            heading: `PERMISSION FROM THE LESSOR FOR BOOKING CONDO FACILITIES`,
            details: `For Condo facilities that require special booking notice (if applicable to the condo: e.g., BBQ-Pits, Function Rooms, etc.), the Tenant needs to go through the Lessor. The booking requestshould be made at least two weeks in advance and there will be an additional administrativefee of S$10.00 payable to the Lessor per booking of a facility that requires payment to thecondo management, on top of the facility booking fee that is payable to the condomanagement office. Facilities such as the swimming pool, gym, etc. which do not require anyspecial booking notice or payment to the condo management office can be used any timeduring opening hours according to the rules and regulations of the condo management`
        },
        {
            ind: 'w',
            heading: `ACCESS CARD/TOKEN (IF APPLICABLE)`,
            details: `The Tenant must keep the access cards safe and secure and shall not lose the cards and should not share the cards with anyone else. In a case where a card is lost, the Tenant will have to inform the Lessor immediately and the cost of card replacement will cost S$60.00 per access card, payable to the Lessor and can take up to 4 weeks of time, depending on the complexity of the process of replacing the lost access card`
        },
        {
            ind: 'x',
            heading: `CONFIDENTIALITY`,
            details: `Always keep this tenancy agreement private and confidential and do not divulge or submit any information to any party without the consent of the Lessor. Breach of this term is liable for immediate termination which includes the forfeiture of the deposit.`
        },
        {
            ind: 'y',
            heading: `REMOVAL OF ITEMS ON EXPIRY OR TERMINATION OF THE TENANCY`,
            details: `To remove all of the items belonging to the Tenant from the Premises upon the expiry or sooner termination of this tenancy, failing which the Lessor shall be entitled to treat all such items as abandoned by the Tenant, and the Lessor shall be entitled to treat or dispose of them in whatsoever manner the Lessor deems fit, at the costs and expense of the Tenant.`
        },
        {
            ind: 'z',
            heading: `NOTICE`,
            details: `Notwithstanding anything herein contained, the Lessor can unilaterally terminate this tenancy at any time before the expiration of the agreed duration of stay with a Sixty-Day notice via email, if it is required during special circumstances as indicated by the Lessor. It shall be lawful for the Tenant to oblige and to pay the remaining duration͛ s rent before vacating the premises should the tenancy be terminated or the Tenant decides to vacate. In case the Tenant has to vacate the premises, the Lessor can suggest alternative accommodations to the Tenant as to what is available during that time and it is up to the Tenant to take up the alternative offer. In the event that the Tenant does not take up the alternative option, the lease will be treated as terminated and the Deposit of the Tenant will be refunded after the necessary deductions as per required by the Tenancy Agreement, and for any excess rental pre-paid upfront, the excess rental (calculated by calendar days) will be refunded back to the Tenant.`
        },
        {
            ind: '',
            heading: ``,
            details: `In case the Tenant leaves the premises without making the due payments, the Lessor retains the right to forfeit the deposit made by the Tenant if rental payments are not being paid. The Security Deposit used by the Tenant that is maintained by the Lessor cannot be use`
        },
    ]
    generateClauseTable(doc,FourhClausedata,400)
    doc.text(`5. The Lessor hereby agrees with the Tenant as follows:`,30, doc.y, { align: 'center' })

    const fifthClasusedata = [{
        ind: 'a',
        heading: 'QUIET ENJOYMENT',
        details: `That the Tenant paying the Rent and performing and observing all the Tenant's coven contained in this Agreement, shall peaceably hold and enjoy the Premises without interruption from the Lessor or any person rightfully claiming under or in trust for the Lessor.`
    },
    {
        ind: 'b',
        heading: '',
        details: `That upon the first Tenant check-in into the premises, there will be an initial 7 calendar  defects free period, in which the Lessor is obliged to replace or repair any spoilt or unus items in the premises, notwithstanding negligence from the Tenant. The Tenant will hav ensure that the defect is reported during the initial 7 calendar days, and the replacemen repair works undertaken by the Lessor can take place outside the 7 calendar days, subjec the timing or resources availability of the Lessor.`
    },
    {
        ind: '',
        heading: '',
        details: `For defects that are reported after the 7 calendar days, the Lessor shall not be liabl replace or repair these defects and it is the Tenant's responsibility to replace or repiar t defects, up to the stated amount in the Minor Repair Clause as per 4 (i). In the event that Tenant does not get the item repair or replaced during their stay, the cost of repai replacement will be recovered from the Tenant's Security Deposit at the expiry of the Lease.`
    },
    {
        ind: 'c',
        heading: 'AIRCON SERVICING',
        details: `To get the Air Conditioning units in the premises serviced once every 3 months. The cost  aircon servicing will be borne by the Tenant at a cost of S$15.00 per aircon unit per month  the premises. For any other additional services required as recommended by the Airc Servicing contractor, such as but not limited to Chemical Overhaul, Refrigerant Gas Top-Up  Outdoor Condenser cleaning, the cost shall also be borne by the Tenant.`
    },
    {
        ind: 'd',
        heading: 'ROUTINE MAINTENANCE',
        details: `To arrange for apartment cleaning twice a month that is chargeable at a cost of S$50.00 p session to the Tenant unless otherwise agreed by Lessor in writing. The Tenant shall agree  receive the cleaning staff at a time and date designated by the Lessor. The cleaning only cove the common areas of the premises and the bathrooms and not the bedrooms, unless otherwi stated and agreed upon between Lessor and Tenants in writing for an additional charge p bedroom.`
    },
    {
        ind: 'e',
        heading: 'INSPECTION',
        details: `To arrange for an apartment inspection once a month if required by the Lessor. The Tenant shall agree to receive the company staff at a time and date agreed between the Lessor and the Tenant.`
    },
    {
        ind: 'f',
        heading: `PROFESSIONAL MOVE-OUT CLEANING`,
        details: `At the expiry of the lease, the Tenant acknowledges, understands, and agrees that the Lessor will conduct a mandatory Professional Move Out Cleaning of the premises at the rate of S$200.00 per person and S$200.00 for the common area (Total cost to be determined by how many persons are staying in the premises), unless otherwise agreed and approved by the Lessor. The Lessor shall, at its sole discretion, be entitled to deduct the charges of such cleaning services from the Security Deposit.`
    },
    {
        ind: 'g',
        heading: `LATE FEE FOR DELAY IN DEPOSIT REFUND`,
        details: `To pay a late fee to the Tenant for any delay in providing the Deposit Refund Summary to the Tenant, as per the scope of clause 4(k). This late fee will be S$10.00 per room per day for any delays after the completion of the agreed period of 45-days after the expiry of the term and after taking into account all the deductions (if any) and conditions mentioned in clause 4 (c)`
    },
    {
        ind: 'h',
        heading: ``,
        details: `In case the delay in refunding the Deposit is due to the additional time required to settle any ongoing claims, dispute, or disagreement regarding any deductions/ charges made by the Lessor under the scope of this agreement or pending rental payments/outstanding amounts or non-fulfillment of any terms mentioned in the aforesaid agreement by the Tenant or due to any change in the bank details or due to any legal proceedings initiated by the Tenant or the Lessor, this provision of late fee will be considered null and void.`
    },
    {
        ind: '',
        heading: '',
        details: `The late fee/refund shall be made in the same bank account from which the Tenant has paid the last rental to the Lessor. In case the Tenant wishes to receive the same in any other account, the details of the account have to be provided to the Lessor at least 15 days in advance`
    },
    {
        ind: 'i',
        heading: `STORAGE ROOM.`,
        details: `The utility/storage room in the yard/kitchen area (if present in the premises) is to be considered reserved by the Lessor and is not part of this lease. Tenants' belongings must be cleared of this room on demand of the Lessor. The room may be occupied by the Lessor's belongings`
    },
    {
        ind: '',
        heading: ``,
        details: `The Lessor will also have the final say in deciding what constitutes an item or a repair, in the event that there is any disagreement in the repair or replacement works, and the Lessor reserves the right to engage their own appointed contractor, and the cost of repair up to the minor repair clause cost per item or per repair shall be borne by the Tenant.`
    },
    {
        ind: 'j',
        heading: `ACCESS TO THE PREMISES`,
        details: `To permit the Lessor and its agents, surveyors, and workmen with all necessary appliances to enter upon the Premises at all reasonable times by prior appointment for the purpose whether of viewing the condition thereof or of doing such works and things as may be required for any repairs, alterations or improvements whether of the Premises or of any parts of any building to which the Premises may form a part of or adjoin. To permit viewing at all reasonable times by prior appointment to enter the Premises for the purpose of taking a new Tenant or if the owner wants to sell the Premises. The Lessor will send their representative to enter and inspect the apartment once a month if required by the Lessor.`
    },

    {
        ind: 'k',
        heading: `LATE FEE`,
        details: `To pay a late fee for any delay in the payment of monthly rental to the Lessor. In addition, without prejudice to any other right, power, or remedy of the Lessor, if the Rent or any par it or any other sum payable by the Tenant to the Lessor remains unpaid. This fee of S$1 per room (Ten Only) per day shall be payable after the expiry of the 5-day grace pe provided to the Tenant to pay the rent (from the 25th day to the last day of the month prio the month for which the rent is due and is being paid). The delay shall be calculated from day on which such sum falls due for payment, to the date on which such sum is paid t recovered by the Lessor (credited to the account of the Lessor). The Lessor may recover late fee with a separate invoice sent to the Tenant as if the late fee were rent in arrears`
    },
    {
        ind: 'l',
        heading: `PETS`,
        details: `Not to keep, or bring onto, the Premises or any part thereof, any pet(s) or bird(s) leg permitted to be pets without the prior written permission of the Lessor and to comply  any conditions imposed by the Lessor in the event of such permission being granted.`
    },]
    generateClauseTable(doc,fifthClasusedata,650)

    doc.text(`6 Provided always and it is expressly agreed as follows`,30, doc.y, { align: 'center' })

    const sixthClausedata = [
        {
            ind: 'a',
            heading: `LESSOR'S RIGHT RE-EN (NON-PAYMENT RENT)`,
            details: `If the rent hereby reserved shall be unpaid for 10 days after being payable, the Lessor sh be lawfully entitled at any time thereafter to re-enter the Premises or any part there Upon re-entry, this tenancy shall be absolutely terminated but without prejudice to the ri of action of the Lessor in respect of any breach or any antecedent breach of this Tena Agreement by the Tenant, including forfeiture of the total security deposit paid to the Les as per clause 4 (c).`
        },
        {
            ind: '',
            heading: `RE-EN (OTHER BREACHES)`,
            details: `If at any time there shall be any other breach by the Tenant for failing or neglecting perform or observe any of the terms and conditions of this Tenancy Agreement, the Les shall serve on the Tenant a written notice specifying`
        },
        {
            ind: '',
            heading: '',
            details: `i) the particulars and details of the breach complained of; and`
        },
        {
            ind: '',
            heading: '',
            details: `ii) if the breach is capable of remedy, providing time for the Tenant to remedy the breach`
        },
        {
            ind: '',
            heading: '',
            details: `iii) requiring the Tenant to make monetary compensation for the breach`
        },
        {
            ind: '',
            heading: '',
            details: `and should the Tenant omit, fail or refuse to comply with the written notice, the Lessor sh be lawfully entitled at any time thereafter to re-enter the Premises or any part thereof,  thereupon this tenancy shall be absolutely terminated and the deposit forfeited but with prejudice to the right of action of the Lessor in respect of any breach or any antecedent bre of this Tenancy Agreement by the Tenant`
        },
        {
            ind: 'b',
            heading: `UNTENANTABI Y LEADING SUSPENSION RENT`,
            details: `n the event, the Premises or any part thereof shall at any time during the Term be destro or damaged by fire, lightning, riot, explosion, or any other cause beyond the control of  parties hereto so as to be unfit for occupation and use, then and in every such case, the r hereby reserved, or a just and fair proportion thereof according to the nature and extent the destruction or damage sustained, shall be suspended and cease to be payable in resp of any period while the Premises, or part thereof, shall continue to be unfit for occupation  use by reason of such destruction or damage.`
        },
        {
            ind: '',
            heading: `OPTION RENEW`,
            details: ` If the Tenant wishes to renew the lease of the Premises for a further term, the Lessor w require prior notice of at least two (2) months before the expiry of the Term and the rene shall be on terms to be negotiated and mutually agreed upon.`
        },
        {
            ind: 'c',
            heading: `EA TERMINATION`,
            details: `Notwithstanding anything herein contained, if the Tenant unilaterally desires to terminate t tenancy at any time before the expiration of the agreed duration of stay (as mentioned clause 1), it shall be lawful for the Tenant to pay the remaining months rent before vacat the premises. In case the Tenant leaves the premises without making the due payments,  same shall be recoverable from the remaining Tenant/s failing which the Lessor retains  right to forfeit the deposit made by the Tenant/s, and to continue pursuing the rent owe the Tenant/s.`
        },
        {
            ind: 'd',
            heading: `REMOVAL OF ITEMS ON EXPIRY OR TERMINATION OF THE TENANCY`,
            details: `If after the Tenant has vacated the Premises on the expiry of the Term, any property of the Tenant remains in or on the Premises, and if the Tenant fails to remove such property within seven days after being requested by the Lessor to do so, then the Lessor shall be deemed to be authorized by the Tenant to deal with and to dispose of such property in any manner as the Lessor deems fit and if any expenses are incurred by the Lessor in effecting such disposal they shall be recoverable from the Tenants Security Deposite`
        },
        {
            ind: 'e',
            heading: `LESSOR NOT LIABLE`,
            details: `The Tenant shall indemnify the Lessor against any liability incurred by the Lessor to any third party whose property shall have been sold or disposed of by the Lessor in the mistaken belief held in good faith (which shall be presumed unless the contrary is proved) that such property belonged to the Tenant`
        },
        {
            ind: 'f',
            heading: ``,
            details: `Notwithstanding anything herein contained, the Lessor shall not be liable to the Tenant, nor shall the Tenant have any claim against the Lessor (whether in tort or contract) in respect of or in connection with: any interruption in any of the services in the Building by reason of necessary repair or maintenance of any installations or apparatus (whether within or outside the Premises) or damage thereto or destruction thereof or by reason of mechanical, electrical, electronic, microprocessor, software or other defects, malfunction, failure, breakdown or problem.`
        },
        {
            ind: '',
            heading: ``,
            details: `Any matter under or in connection with this Lease caused by or resulting from any circumstances beyond the Lessor͛ s control (including but not limited to fire, flood, the act of God, force majeure, escape of water, riot, civil commotion, curfew, emergency, labor disputes, lack of transportation, disruption of traffic or shortage of manpower, fuel, materials, electricity or water).`
        },
        {
            ind: 'g',
            heading: ``,
            details: `The Lessor shall not be liable or in any way responsible to the Tenant or to a permitted occupier or to any other person for any injury, loss, or damage which may be suffered or sustained by any person or to any property in the Premises or the Building.`
        },
        {
            ind: '',
            heading: `NON-WAIVER`,
            details: `Knowledge or acquiescence by the Lessor of any breach by the Tenant of any of the Tenant͛ s obligations contained in this Agreement shall not operate as a waiver or affect in any way the rights and remedies of the Lessor in respect of the such breach. A waiver by the Lessor shall only be effective if given in writing.`
        },
        {
            ind: 'a',
            heading: `SERVICE OF NOTICE`,
            details: `Any notice required under this Tenancy Agreement shall be sufficiently served: if it is sent by post in a registered letter addressed to the Tenant OR the Lessor at the party's last known address or id sent by email to the email addresses set out below:`
        },
        {
            ind: '',
            heading: '',
            details: `Lessor's official email address: mail@xacco.co`
        },
    ]
    generateClauseTable(doc,sixthClausedata,1000)


    doc.text(`Tenant's email addresses:`,30, doc.y, { align: 'center' })
    {
        data?.otherTenant?.map((item) => {
            doc.text(`${item?.name} : ${item?.email}`)
        })
    }

    const seventhClouserData = [
        {
            ind: ``,
            heading: `GOVERNING LAW AND JURISDICTION`,
            details: `This Agreement shall be governed by and construed in accordance with the laws of Singapore and the parties irrevocably submit to the non-exclusive jurisdiction of the courts of Singapore`,
        },
        {
            ind: 'b',
            heading: `INTERPRETATION OF TERMS AND EXPRESSIONS`,
            details: `Interpretation`,
        },
        {
            ind: '',
            heading: ``,
            details: `In the interpretation of this Agreement except to the extent that such interpretation shall be excluded by or be repugnant to the context when used in this Agreement:`,
        },
        {
            ind: '',
            heading: ``,
            details: ` (i) "Lessor" shall include its assigns and successors in title abd shall in each case include the person for the time being entitled to the reversion immediately expectant upon the determination of this lease.`,
        },
        {
            ind: '',
            heading: ``,
            details: ` (ii) "Managememt Corporation" shall mean that Management Corporation established for the Building under the Land Title (Strata) Act (Cap 158).`,
        },
        {
            ind: '',
            heading: ``,
            details: ` (iii) "Tenants" shall include if the Tenant is an individual his personal representative or if the Tenant is a company his successors in title.`,
        },
        {
            ind: '',
            heading: ``,
            details: ` (iv) "Person" includes any individual, company, firm, partbership, joint venture, association, organization, trust, state, or agency of a state (in each case, whether or not having separate legal personality)`,
        },
        {
            ind: '',
            heading: ``,
            details: ` (v) "Permitted occupier" shall be deemed to be anyone in the Premises or the Building expressly or by implication with the Tenant͛ s authority.`,
        },
        {
            ind: '',
            heading: ``,
            details: ` (vi) The references to "Premises" shall include a reference to any past thereof`,
        },
        {
            ind: '',
            heading: ``,
            details: ` (vii) where two or more persons are included in the term "the Tenant" all convents, agreements, terms, conditions, and restrictions shall be binding on and applicable to them jointly and each of them severally and shall also be binding on and applicable to their personal representatives and permitted assigns respectively jointly and severally. In case of any breach or default of payments by any Tenant covered under this agreement, the Lessor shall be entitled to recover the same equally from the rest of the Tenants.`,
        },
    ]
    generateClauseTable(doc,seventhClouserData,1200)

    doc.text(`AGREED AND SIGNED:`,30, doc.y , { align: 'center' })

    doc.font('customFont.ttf').fontSize(20)
        .text(`${data?.tenantName}`)
    doc.text(`_____________________________________`);
    doc.font('Times-Roman').fontSize(8)
    doc.text(`Signature`);
    doc.text(`Name: ${data?.tenantName}`);
    doc.text(`Date: ${data?.signedDate}`);
    doc.text(`Public IP: ${data?.ipAddress}`);
    doc.text(`Passport No.: ${data?.tenantPassport}`);
    doc.text(`Tenants in group:`);
    data?.otherTenant?.map((item) => {
        doc.text(`${item.name} (${item.passport})`);

    })
    doc.text(`Lessor:`)
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


}

// Pipe the PDF into a writable stream
export const singaporeContractGenerator = async (data) => {
    const passThrough = new PassThrough();
    const doc = new PDFDocument();
    doc.pipe(passThrough);
    generateHeader(doc, data);
    doc.end();

    try {
        const url = await uploadPdfToS3(passThrough, 'contract.pdf');
        console.log('File URL:', url);
        return url;
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};
