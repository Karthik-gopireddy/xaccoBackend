import e, { Request, Response } from "express";
import { AroundTown } from "../models/aroundtownd.Schema";

// export const createAroundTown = async (req: Request, res: Response) => {
//    const data=req.body
//    console.log(data)
//     try {        
//         const aroundTown = await AroundTown.create({
//             name: req.body.name,
//             heroImage: req.body.heroImageUrl,
//             about: req.body.about,
//             photos: req.body.photosUrl,
//             universities: req.body.universities,
//             tipImage: req.body.tipImageUrl,
//             tipData: req.body.tipData,
//             tipperName: req.body.tipperName,
//             tipperDesignation: req.body.tipperDesignation,
//             food: req.body.food,
//             places: req.body.places
//         })
//         res.status(201).json({ data: aroundTown })
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({ error: error })
//     }
// }
export const createAroundTown = async (req: Request, res: Response) => {
    console.log(req.body);

    const requiredFields = [
        "name",
        "heroImageUrl",
        "about",
        "photosUrl",
        "universities",
        "tipImageUrl",
        "tipData",
        "tipperName",
        "tipperDesignation",
        "food",
        "places",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
        return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
    }

    try {
        const aroundTown = await AroundTown.create({
            name: req.body.name,
            heroImage: req.body.heroImageUrl,
            about: req.body.about,
            photos: req.body.photosUrl,
            universities: req.body.universities,
            tipImage: req.body.tipImageUrl,
            tipData: req.body.tipData,
            tipperName: req.body.tipperName,
            tipperDesignation: req.body.tipperDesignation,
            food: req.body.food,
            places: req.body.places,
        });
        res.status(201).json({ data: aroundTown });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};


export const getAroundTown = async (req: Request, res: Response) => {
    try {
        if (req.query.id) {
            const aroundTown = await AroundTown.findOne({
                where:{id:req.query.id}
            });
            res.status(200).json({ data: aroundTown })
        }
        else {
            const aroundTown = await AroundTown.findAll({order: [['createdAt', 'DESC']]});
            res.status(200).json({ data: aroundTown })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error })
    }
}