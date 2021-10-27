import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

it('returns a valid order that belongs to a valid authenticated user', async() => {
    //Create a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Concert',
        price: 232
    });
    await ticket.save();

    //Create order with ticket
    const user = global.signin();
    const { body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({
            ticketId: ticket.id
        }).expect(201);

    //Retrieve an order with auth user
    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
});


it('returns an error when a user tries to fetch other users orders', async() => {
    //Create a ticket
    const ticket = await Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Concert',
        price: 232
    });
    await ticket.save();

    //Create order with ticket
    const user = global.signin();
    const { body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({
            ticketId: ticket.id
        }).expect(201);

    //Retrieve an order with auth user
    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', global.signin())
        .send()
        .expect(401);
});