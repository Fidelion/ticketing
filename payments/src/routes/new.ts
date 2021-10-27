import { BadRequestError, NotAuthorizedError, NotFoundError, routeHandler, validateRequest, OrderStatus } from "@ticketsnode/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { Order } from "../models/order";
import { Payment } from "../models/payment";
import { natsClient } from "../nats-client";
import { stripe } from "../stripe";

const router = express.Router();

router.post('/api/payments', 
    routeHandler,
    [
        body('token')
        .not()
        .isEmpty(),
        body('token')
        .not()
        .isEmpty()
    ],
    validateRequest,
    async(req: Request, res: Response) => {
        const { token, orderId } = req.body;

        const order = await Order.findById(orderId);

        if(!order) {
            throw new NotFoundError();
        }

        if(order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        if(order.status === OrderStatus.Cancelled) {
            throw new BadRequestError("Cannot create payment for cancelled order");
        }

        const charge = await stripe.charges.create({
            amount: order.price * 100,
            currency: 'usd',
            source: token
        });

        const payment = Payment.build({
            orderId,
            stripeId: charge.id
        });
        await payment.save();
        
        new PaymentCreatedPublisher(natsClient.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId
        });

        res.status(201).send({ id: payment.id });
});

export { router as createPaymentRouter };