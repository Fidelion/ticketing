import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { authCookie } from "../../test/auth-helper";
import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { natsClient } from "../../nats-client";

it('returns an error if the ticket does not exist', async() => {
    const ticketId = new mongoose.Types.ObjectId();
    const cookie = await authCookie();

    await request(app)
            .post('/api/orders/')
            .set('Cookie', cookie)
            .send({ticketId})
            .expect(404);
});

it('returns an error if the ticket is already reserved', async() => {
    const cookie = await authCookie();
    const ticket = await Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "Concert",
        price: 303
    });
    await ticket.save();

    const order = await Order.build({
        userId: "dasdadsa",
        ticket,
        status: OrderStatus.Created,
        expiresAt: new Date()
    });
    await order.save();

    await request(app).post('/api/orders').set('Cookie', cookie).send({ticketId: ticket.id}).expect(400);

})

it('submits order successfully', async() => {
    const ticket = await Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "Concert",
        price: 322
    });
    await ticket.save();

    await request(app).post('/api/orders').set('Cookie', global.signin()).send({ticketId: ticket.id}).expect(201);
});

it('invokes mock function for calling created order event', async() => {
    const ticket = await Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "Concert",
        price: 322
    });
    await ticket.save();

    await request(app).post('/api/orders').set('Cookie', global.signin()).send({ticketId: ticket.id}).expect(201);

    expect(natsClient.client.publish).toHaveBeenCalled();
})