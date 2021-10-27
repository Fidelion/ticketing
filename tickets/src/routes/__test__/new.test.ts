import request from 'supertest';
import { app } from '../../app';
import { authCookie } from '../../test/auth-helper';
import { Ticket } from '../../models/ticket';
import { natsClient } from '../../nats-client';


it('it has route handler listening to /api/tickets for a post method request', async() => {

    const response = await request(app).post('/api/tickets').send({});

    expect(response.status).not.toEqual(404);
});

it('it can only be accessed if user is signed in', async() => {
    await request(app).post('/api/tickets').send({}).expect(401);
});

it('returns status other then 401 if user is authenticated', async() => {

    const cookie = await authCookie();

    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({});

    expect(response.status).not.toEqual(401);
})

it('it returns an error if an invalid title is provided', async() => {
    
    const cookie = await authCookie();

    await request(app).post('/api/tickets').set('Cookie', cookie).send({
        title: '',
        price: 10
    }).expect(400);


    await request(app).post('/api/tickets').set('Cookie', cookie).send({
        price: 10
    }).expect(400);
    
});

it('it returns an error if invalid price is provided', async() => {

    const cookie = await authCookie();

    await request(app).post('/api/tickets').set('Cookie', cookie).send({
        title: 'almfpoas',
        price: -10
    }).expect(400);


    await request(app).post('/api/tickets').set('Cookie', cookie).send({
        title: 'asdasfa'
    }).expect(400);

});

it('it creates a ticket with valid inputs', async() => {

    const cookie = await authCookie();

    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    await request(app).post('/api/tickets').set('Cookie', cookie).send({
        title: 'asfasf',
        price: 20
    }).expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
});

it('returns event data on completion', async() => {
    const cookie = await authCookie();

    await request(app).post('/api/tickets').set('Cookie', cookie).send({
            title: 'asfasf',
            price: 20
        }).expect(201);

    expect(natsClient.client.publish).toHaveBeenCalled();
})