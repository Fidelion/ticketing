import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { routeHandler, validateRequest } from '@ticketsnode/common';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsClient } from '../nats-client';

const router = express.Router();

router.post('/api/tickets', routeHandler, [
    body('title').not().isEmpty().withMessage('Title must not be empty'),
    body('price').isFloat({ gt: 0}).withMessage('Price must be higher then 0')
], validateRequest, async(req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = Ticket.build({
        title,
        price,
        userId: req.currentUser!.id
    });

    await ticket.save();
    new TicketCreatedPublisher(natsClient.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version
    });
    res.status(201).send(ticket);
});

export { router as createTicketRouter };