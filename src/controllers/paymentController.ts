import { Request, Response } from "express";
import { uploadSingleFile } from "../utils/s3-setup";
import { Payment } from "../models/payment.Schema";
import { Booking } from "../models/booking.Schema";
import { Property } from "../models/property.Schema";
import Stripe from "stripe";
import { RequestWithUser } from "./ratingController";
import { Tenant } from "../models/tenant.Schema";
import { PaySplit } from "../models/paymentSplit";
import { sequelize } from "../db/sequelize";
import { Op, where } from "sequelize";


const stripe = new Stripe(process.env.STRIPESECRET);

export const servicePaymentOffline = async (req: RequestWithUser, res: Response) => {
    try {
        let payment_proof = ""
        if (req.file) {
            payment_proof = await uploadSingleFile(req.file);
        }
        const paySplit = await PaySplit.findByPk(req.body.paymentId)
        if (!paySplit) {
            return res.status(400).json({ message: 'Payment Not Found' })
        }
        if (paySplit.paymentStatus == 'paid') {
            return res.status(400).json({ message: 'Payment has already marked paid' })
        }

        const booking = await Booking.findByPk(paySplit.bookingId)

        if (booking.status == 'tenant_details' || booking.status == 'document_uploaded') {
            return res.status(427).json({ message: 'Please complete all previous steps to proceed' })
        }
        await PaySplit.update(
            {
                paymentStatus: 'paid'
            },
            {
                where: { id: req.body.paymentId }
            }
        )
        const payment = await Payment.create({
            type: (booking.status == 'contract_signed' || booking.status == 'final_payment_partially_done') ? 'final payment' : 'service fee',
            meathod: 'offline',
            amount: paySplit.amount,
            property: booking.property,
            booking: booking.id,
            status: 'paid',
            paymentProof: payment_proof,
            paidBy: req.user.user.email,
            paidUserName: req.user.user.name,
            refundAmount: null,
            refundedDate: null
        })
        const paySplits = await PaySplit.findAll({
            where: {
                bookingId: booking.id,
                paymentStatus: 'unpaid'
            }
        })
        if (paySplits.length == 0) {
            await booking.update({
                status: (booking.status == 'contract_signed' || booking.status == 'final_payment_partially_done') ? 'final_payment_done' : 'service_fee_paid',
                servicePaymentId: payment.id,
                paySplitCreate: false
            })
            await PaySplit.destroy({
                where: {
                    bookingId: booking.id
                }
            })
        }
        else {
            await booking.update({
                status: (booking.status == 'contract_signed' || booking.status == 'final_payment_partially_done') ? 'final_payment_partially_done' : 'service_fee_partially_paid',
                servicePaymentId: payment.id
            })
        }



        res.status(200).json({ data: payment })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error })
    }
}
export const statusOnlinePayment = async (req: Request, res: Response) => {
    try {
        const { id, status } = req.query
        if (!id || !status) {
            return res.status(403).json({ error: 'Send Both ID and Status' })
        }
        const payment = await Payment.findOne({
            where: { id: id }
        })
        if (payment[0].length == 0) {
            return res.status(403).json({ error: 'Payment Not found' })
        }

        await Payment.update(
            { status: status },
            { where: { id: id } }
        )

        res.status(200).json({ data: `Payment Successfully ${status}` })

    } catch (error) {
        res.status(500).json({ error: error })
    }
}
export const refundOfflinePayment = async (req: Request, res: Response) => {
    try {

        const payment = await Payment.findOne({
            where: { id: req.body.id }
        })
        if (payment.status == 'refunded') {
            return res.status(403).json({ err: "Payment already refunded" })
        }
        else if (payment.status == 'denied') {
            return res.status(403).json({ err: "Payment had been declined in the past" })
        }
        await payment.update({
            status: 'refunded',
            refundAmount: req.body.refundAmount,
            refundedDate: new Date()
        })
        res.status(200).json({ message: "Payment set to be refunded" })
        return payment;
    } catch (error) {
        console.log(error, "Err")
        res.status(500).json({ err: error })
    }
}
export const servicePaymentOnline = async (req: RequestWithUser, res: Response) => {
    try {

        const booking = await Booking.findByPk(req.body.booking)
        const paymentInstance = await PaySplit.findByPk(req.body.paymentId)
        if (!booking) {
            return res.status(404).json({ message: 'Booking Not Found' })
        }
        if (!paymentInstance) {
            return res.status(404).json({ message: 'Payment Not Found' })
        }

        if (booking.status == 'tenant_details' || booking.status == 'document_uploaded') {
            return res.status(427).json({ message: 'Please complete all previous steps to proceed' })
        }

        const amount = parseInt(paymentInstance.amount)
        const line_items = [
            {
                price_data: {
                    currency: req?.body?.currency || "usd",
                    product_data: {
                        name: "Verfication and Deposite fee"
                    },
                    unit_amount: amount * 100,
                },
                quantity: 1

            }
        ]
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: line_items,
            mode: "payment",
            customer_email: req.user.user.email,
            metadata: {
                type: paymentInstance.type,
                booking: booking.id,
                payment: paymentInstance.id
            },
            success_url: `http://xacco.moshimoshi.cloud/paymentConfirm?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: "http://xacco.moshimoshi.cloud/payment?bookingId=2a71d3d3-d690-4250-86c6-168a2700afaf"
        })

        res.status(200).json({ sessionId: session.id })
    } catch (error) {
        console.log(error, "Error")
        res.status(500).json({ error: error })
    }
}
export const handlePaymentCompletion = async (req: RequestWithUser, res: Response) => {
    try {
        const { sessionId } = req.body;

        const session = await stripe.checkout.sessions.retrieve(sessionId);


        if (session.payment_status === 'paid') {
            const booking = await Booking.findByPk(session.metadata.booking)
            const payspilit = await PaySplit.findByPk(session.metadata.payment)

            await payspilit.update({
                paymentStatus: 'paid'
            })
            const payment = await Payment.create({
                type: (booking.status == 'contract_signed' || booking.status == 'final_payment_partially_done') ? 'final payment' : 'service fee',
                meathod: 'online',
                amount: session.amount_total / 100,
                property: booking.property,
                booking: booking.id,
                status: 'paid',
                paymentProof: session.id,
                paidBy: session.customer_email,
                paidUserName: session?.customer_details?.name,
                refundAmount: null,
                refundedDate: null
            })
            const paySplits = await PaySplit.findAll({
                where: {
                    bookingId: booking.id,
                    paymentStatus: 'unpaid'
                }
            })
            if (paySplits.length == 0) {
                await booking.update({
                    status: (booking.status == 'contract_signed' || booking.status == 'final_payment_partially_done') ? 'final_payment_done' : 'service_fee_paid',
                    servicePaymentId: payment.id,
                    paySplitCreate: false
                })
                await PaySplit.destroy({
                    where: {
                        bookingId: booking.id
                    }
                })
            }
            else {
                await booking.update({
                    status: (booking.status == 'contract_signed' || booking.status == 'final_payment_partially_done') ? 'final_payment_partially_done' : 'service_fee_partially_paid',
                    servicePaymentId: payment.id
                })
            }


            res.status(200).send('Payment completed successfully');
        }
        else {
            res.status(400).send('Payment not successful');
        }
    } catch (error) {
        console.error('Error handling payment completion:', error.message);
        res.status(500).send('Internal Server Error');
    }
}
export const createPaySpilit = async (req: RequestWithUser, res: Response) => {
    try {
        const { bookingId, payspilit, full } = req.body;
        const payspilits = await PaySplit.findAll({
            where: {
                bookingId: bookingId, paymentStatus: {
                    [Op.or]: ['paid', 'pending']
                }
            }
        })
        if (payspilits.length !== 0) {
            return res.status(400).json({ err: 'Payment has already been done for past split' })
        }
        else {
            await PaySplit.destroy({
                where: { bookingId: bookingId }
            })
        }
        const booking = await Booking.findOne({
            where: { id: bookingId }
        })
        if (!booking) {
            return res.status(403).json({ data: "Booking not found" })
        }
        if (req?.user?.user?.id !== booking.bookedBy) {
            return res.status(403).json({ data: "Only who Created the booking can initiate payment" })
        }
        booking.update({
            paySplitCreate: true
        })
        const paymentSpilitDetail = []
        if (full) {
            const tenant = await Tenant.findOne({
                where: {
                    email: req.user.user.email,
                    booking: bookingId
                }
            })

            const payspilit = await PaySplit.create({
                bookingId: bookingId,
                tenantsId: tenant.id,
                type: booking.status == 'document_verified' ? 'rent_pay' : 'service_fee',
                amount: booking.status == 'document_verified' ? parseFloat(booking.monthlyRent) : parseFloat(booking.serviceFee) + parseFloat(booking.monthlyRent),
                paymentStatus: "unpaid",

            })
            paymentSpilitDetail.push(payspilit)
        }
        else {
            let totalAmount = 0
            await Promise.all(
                payspilit.map(async (item) => {
                    const tenant = await Tenant.findOne({
                        where: { id: item.tenant, booking: bookingId }
                    })
                    if (!tenant) {
                        return res.status(403).json({ error: 'Tenants does not exist' })
                    }
                    totalAmount += parseFloat(item.amount)

                })
            )

            if (totalAmount !== (booking.status == 'contract_signed' ? parseFloat(booking.monthlyRent) : parseFloat(booking.serviceFee) + parseFloat(booking.monthlyRent))){
                return res.status(403).json({ error: "Total Booking Amount is not equal to total division" })
            }
            await Promise.all(
                payspilit.map(async (item) => {
                    const payspilit = await PaySplit.create({
                        bookingId: bookingId,
                        tenantsId: item.tenant,
                        type: booking.status == 'contract_signed' ? 'rent_pay' : 'service_fee',
                        amount: item.amount,
                        paymentStatus: "unpaid"
                    })
                    paymentSpilitDetail.push(payspilit)

                })
            )
        }

        res.status(200).json({ data: paymentSpilitDetail, message: 'Payment Split created' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error While Spliting the payment' })
    }
}
export const getPaymentList = async (req: Request, res: Response) => {
    try {
        const { booking, paymentId } = req.query;
        if (paymentId) {
            const payment = await PaySplit.findOne({
                where: { id: paymentId }
            })
            res.status(200).json({ payment: payment })
        }
        else {
            const paymentListQuery = 'select P.*,T.name from "PaySplits" as P join "Tenants" T on P."tenantsId"=T.id where P."bookingId"=:booking';
            const paymentListResult = (await sequelize.query(paymentListQuery, {
                replacements: { booking: booking },
            }));
            res.status(200).json({ paymentList: paymentListResult[0] })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ err: 'Error while fetfching data', error })
    }
}