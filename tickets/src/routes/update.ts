import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
    routeHandler,
    validateRequest,
    NotFoundError,
    NotAuthorizedError,
    BadRequestError
} from '@ticketsnode/common';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsClient } from '../nats-client';


const router = express.Router();

router.put('/api/tickets/:id',  
    routeHandler,[
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title must not be empty'),
    body('price')
        .isFloat({ gt: 0 }).withMessage('Price must be greater then 0')
],
    validateRequest, 
    async(req: Request, res: Response) => {
        const ticket = await Ticket.findById(req.params.id);

        if(!ticket) {
            throw new NotFoundError();
        }

        if(ticket.orderId) {
            throw new BadRequestError(`Can't edit ticket that has been reserved.`);
        }

        if(ticket.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        const { title, price } = req.body;

        ticket.set({
            title,
            price
        });

        await ticket.save();

        new TicketUpdatedPublisher(natsClient.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version
        });

        res.send(ticket);
});


export { router as updateTicketRouter };