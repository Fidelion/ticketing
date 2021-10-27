import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

const buildTicket = async() => {
    const ticket = await Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "Concert",
        price: 232
    });

    await ticket.save();
    
    return ticket;
}

it('returns order for specific user', async() => {
    //Create three tickets
    const ticketOne = await buildTicket();
    const ticketTwo = await buildTicket();
    const ticketThree = await buildTicket();
    

    //Create two authenticated users
    const userOne = global.signin();
    const userTwo = global.signin();

    //Create Order for userOne
    await request(app).post('/api/orders').set('Cookie', userOne).send({
        ticketId: ticketOne.id
    }).expect(201);

    //Create two Orders for userTwo
    const { body: orderOne } = await request(app).post('/api/orders').set('Cookie', userTwo).send({
        ticketId: ticketTwo.id
    }).expect(201);

    const { body: orderTwo } = await request(app).post('/api/orders').set('Cookie', userTwo).send({
        ticketId: ticketThree.id
    }).expect(201);

    //Make request to get all orders for userTwo
    const response = await request(app).get('/api/orders').set('Cookie', userTwo).expect(200);

    //Make sure to only get orders for userTwo
    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[1].id).toEqual(orderTwo.id);
    expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
    expect(response.body[1].ticket.id).toEqual(ticketThree.id);
})