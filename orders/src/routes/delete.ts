import express, { Request, Response } from 'express';
import { routeHandler, NotAuthorizedError, NotFoundError } from '@ticketsnode/common';
import { Order, OrderStatus } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsClient } from '../nats-client';

const router = express.Router();

router.delete('/api/orders/:orderId', routeHandler, async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId).populate('ticket');

  if(!order) {
    throw new NotFoundError();
  }

  if(order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }

  order.status = OrderStatus.Cancelled;

  await order.save();

  new OrderCancelledPublisher(natsClient.client).publish({
    id: order.id,
    version: order.version,
    ticket: {
      id: order.ticket.id
    }
  });
  
  res.status(204).send(order);
});


export { router as deleteOrderRouter };
