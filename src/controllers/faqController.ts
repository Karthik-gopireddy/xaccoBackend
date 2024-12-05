import { Request, Response } from "express"
import { Enquiry } from "../models/enquiry.Schema"
import { Contact } from "../models/contact.Scema"
import { where } from "sequelize"
import { Faq } from "../models/faq.Schema";

export const createFaq = async (req: Request, res: Response) => {
    try {
        const { question,answer } = req.body;
        const faqData = await Faq.create({
            question,
            answer,            
            status: true
        });
        res.status(201).json({ data: faqData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getFaq = async (req: Request, res: Response) => {
    try {
        const faqData = await Faq.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ data: faqData })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error })
    }
}
export const adminFaq = async (req: Request, res: Response) => {
    try {        
        await Faq.update({
            ...req.body
        },
            { where: { id: req.body.id } }
        )
        res.status(200).json({data:'Faq Updated'})
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error })
    }
}
export const deleteFaq = async (req: Request, res: Response) => {
    try {        
        await Faq.destroy({where:{id:req.body.id}})
        res.status(200).json({data:'Faq deleted'})
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error })
    }
}