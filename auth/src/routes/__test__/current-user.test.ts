import request from 'supertest';
import { app } from '../../app';
import { authCookie } from '../../test/auth-helper';


it('responds with details about current user', async() => {
    const cookie = await authCookie();


    const response = await request(app).get('/api/users/currentuser').set('Cookie', cookie).send().expect(200);

    expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('responds with null if current user is not authenticated', async() => {
    const response = await request(app).get('/api/users/currentuser').send().expect(200);

    expect(response.body.currentUser).toEqual(null);
})