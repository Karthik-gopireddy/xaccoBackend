import { AdminBankDetails } from "../models/adminbank.Schema";
import e, { Request, Response } from "express";

export const create = async (req: Request, res: Response) => {
    try {
      console.log(req.body)
        const bankExist = await AdminBankDetails.findOne({
            where: {
                accountNumber: req.body.accountNumber
            }
        })
        if (!bankExist) {
            const bank = await AdminBankDetails.create({
                beneficiaryName: req.body.benficiaryName,
                accountNumber: req.body.accountNumber,
                IFSC: req.body.IFSC,
                bankName: req.body.bankName,
            });
            res.status(201).json({ data: bank })
        } else {
            res.status(500).json({ message: "bank already exist" })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error })
    }
}
export const getAllBanks = async (req: Request, res: Response) => {
    try {
        const { id } = req.query;
        if (id) {
          const bank = await AdminBankDetails.findOne({
            where: { id: id },
          });
          if (!bank) {
            res.status(403).json({ message: "bank doesnt exist" });
          }
          res.status(200).json({ data: bank });
        } else {
          const banks = await AdminBankDetails.findAll({order: [['createdAt', 'DESC']], where:{
            status:true
          }});
          res.status(200).json({ data: banks });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error })
    }
}
export const deleteBank = async (req: Request, res: Response) => {
    try {
        const {id} = req.query
        const bank = await AdminBankDetails.destroy({
            where
                : {
                id:id
            }
        })
        res.status(201).json({ message:"deleted" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error })
    }
}
export const updateBank = async (req: Request, res: Response) => {
    try {
        const updates: { [key: string]: unknown } = {};      
        if (req?.body?.beneficiaryName) {
            updates.beneficiaryName = req.body.beneficiaryName;
          }
          if (req?.body?.accountNumber) {
            updates.accountNumber = req.body.accountNumber;
          }
          if (req?.body?.IFSC) {
            updates.IFSC = req.body.IFSC;
          }            
          if (req?.body?.bankName) {
            updates.bankName = req.body.bankName;
          }            
          if (req?.body?.status) {
            updates.status = req.body.status;
          }            
      
          const [rowsUpdated, [updatedBank]] = await AdminBankDetails.update(updates, {
            where: { id: req.body.id },
            returning: true, // return the updated rows
          });
      
          if (rowsUpdated === 0) {
            return res.status(404).json({ message: "City not found" });
          }
      
          res.status(200).json({ data: updatedBank });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error })
    }
}