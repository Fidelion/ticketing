import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { authCookie } from '../../test/auth-helper';

it('it returns and error if ticket is not found', async() => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it('it returns a ticket if ticket is found', async() => {
    const title = 'asdasd';
    const price = 20;

    const cookie = await authCookie();
    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({
        title,
        price
    }).expect(201);

    const ticketResponse = await request(app).get(`/api/tickets/${response.body.id}`).send({}).expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
});