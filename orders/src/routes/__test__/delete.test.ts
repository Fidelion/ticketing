import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { natsClient } from "../../nats-client";
import mongoose from "mongoose";


it('marks order cancelled on request', async() => {
    //Create Ticket
    const ticket = await Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Concert',
        price: 2322
    });
    await ticket.save();

    //Make request to create order
    const user = global.signin();
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    //Make request to cancel order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    //find updated order and check if it is cancelled
    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it('invokes mock function for calling deleted order event', async() => {
    //Create Ticket
    const ticket = await Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Concert',
        price: 2322
    });
    await ticket.save();

    //Make request to create order
    const user = global.signin();
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    //Make request to cancel order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    expect(natsClient.client.publish).toHaveBeenCalled();
})