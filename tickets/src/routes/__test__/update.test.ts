import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { authCookie } from '../../test/auth-helper';
import { natsClient } from '../../nats-client';
import { Ticket } from '../../models/ticket';


it('returns 404 if the id of ticket does not exist', async() => {
    const id = new mongoose.Types.ObjectId().toHexString();

    const cookie = await authCookie();
    await request(app).put(`/api/tickets/${id}`).set('Cookie', cookie).send({
        title: 'dasdas',
        price: 20
    }).expect(404);
});

it('returns 401 if the the user is not authenticated', async() => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
    .put(`/api/tickets/${id}`)
    .send({
        title: 'dasdas',
        price: 20
    }).expect(401);

});

it('returns 401 if the user does not own the ticket', async() => {
    const cookie = await authCookie();

    const response = await request(app).post(`/api/tickets`).set('Cookie', cookie).send({
        title: 'asdasd',
        price: 20
    });

    const cookie2 = await authCookie();
    await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', cookie2).send({
        title: 'asdasdasd',
        price: 1000
    }).expect(401);

});

it('returns 400 if the the user provides invalid title or price', async() => {
    const cookie = await authCookie();
    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({
        title: 'asdasda',
        price: 20
    });

    await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({
        title: '',
        price: 200
    }).expect(400);

    await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({
        title: 'asfasfa',
        price: -10
    }).expect(400);
});

it('updates ticket with valid inputs', async() => {
    const cookie = await authCookie();

    const response = await request(app).post(`/api/tickets`).set('Cookie', cookie).send({
        title: 'asdasd',
        price: 20
    });

    const ticketResponse = await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({
        title: 'twete',
        price: 1000
    });

    expect(ticketResponse.body.title).toEqual('twete');
    expect(ticketResponse.body.price).toEqual(1000);
});


it('returns invokes event mock function completion', async() => {
    const cookie = await authCookie();

    const response = await request(app).post(`/api/tickets`).set('Cookie', cookie).send({
        title: 'asdasd',
        price: 20
    });

    const ticketResponse = await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({
        title: 'twete',
        price: 1000
    });

    expect(natsClient.client.publish).toHaveBeenCalled();
});

it('rejects editing ticket that is reserved', async() => {
    const cookie = await authCookie();

    const response = await request(app).post(`/api/tickets`).set('Cookie', cookie).send({
        title: 'asdasd',
        price: 20
    });

    const ticket = await Ticket.findById(response.body.id);

    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString()});

    await ticket!.save();

    const ticketResponse = await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({
        title: 'twete',
        price: 1000
    }).expect(400);

});