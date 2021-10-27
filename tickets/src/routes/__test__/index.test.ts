import request from 'supertest';
import { app } from '../../app';
import { authCookie } from '../../test/auth-helper';


it('it can return list of all tickets', async() => {
    const cookie = await authCookie();

    await request(app).post('/api/tickets').set('Cookie', cookie).send({
        title: 'asdasda',
        price: 20
    });


    await request(app).post('/api/tickets').set('Cookie', cookie).send({
        title: 'asdasda',
        price: 20
    });

    await request(app).post('/api/tickets').set('Cookie', cookie).send({
        title: 'asdasda',
        price: 20
    });

    const response = await request(app).get('/api/tickets').send().expect(200);

    expect(response.body.length).toEqual(3);
})