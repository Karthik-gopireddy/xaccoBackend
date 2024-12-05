import { Request, Response } from "express"
import { Enquiry } from "../models/enquiry.Schema"
import { Contact } from "../models/contact.Scema"
import { where } from "sequelize"

export const createEnquiry = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, enquiry } = req.body;
        const enquiryData = await Enquiry.create({
            name: name ? name : '',
            email: email ? email : '',
            phone: phone ? phone : '',            
            enquiry: enquiry,            
            status: "new"
        });
        res.status(201).json({ data: enquiryData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createEnquiryAbout = async (req: Request, res: Response) => {
    try {
        const { email, phone, name } = req.body;
        const enquiryData = await Contact.create({            
            email: email ? email : '',
            phone: phone ? phone : '',
            name: name ? name : '',
            type:"talk-to-us"
        });
        res.status(201).json({ data: enquiryData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const createNewsLetter = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const enquiryData = await Contact.create({            
            email: email ? email : '',         
            type:"news-letter"
        });
        res.status(201).json({ data: enquiryData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const createContactUs = async (req: Request, res: Response) => {
    try {
        const { email,firstname,lastname,who,phone,enquiry,source } = req.body;
        const enquiryData = await Contact.create({
            email: email ? email : '',         
            firstname: firstname ? firstname : '',         
            lastname: lastname ? lastname : '',         
            who: who ? who : '',         
            phone: phone ? phone : '',         
            enquiry: enquiry ? enquiry : '',         
            source: source ? source : '',         
            type:"contact"
        });
        res.status(201).json({ data: enquiryData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const getEnquiryAdminAbout = async (req: Request, res: Response) => {
    try {
        const enquiryData = await Contact.findAll({
            where:{
                type:"talk-to-us"
            },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ data: enquiryData })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error })
    }
}
export const getNewsLetterFroAdmin = async (req: Request, res: Response) => {
    try {
        const enquiryData = await Contact.findAll({
            where:{
                type:"news-letter"
            },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ data: enquiryData })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error })
    }
}
export const getContactUs = async (req: Request, res: Response) => {
    try {
        const enquiryData = await Contact.findAll({
            where:{
                type:"contact"
            },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ data: enquiryData })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error })
    }
}
export const getEnquiryAdmin = async (req: Request, res: Response) => {
    try {
        const enquiryData = await Enquiry.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ data: enquiryData })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error })
    }
}

export const adminUpdateEnquiryStatus = async (req: Request, res: Response) => {
    try {
        const { id, status } = req.query
        await Enquiry.update({
            status: status
        },
            { where: { id: id } }
        )
        res.status(200).json({data:'Enqury Updated'})
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error })
    }
}