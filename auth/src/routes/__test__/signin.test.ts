import request from "supertest";
import { app } from "../../app";

it('detects user does not exist on signin', async() => {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'password'
        }).expect(400);
});


it('detects wrong email and password on signin', async() => {
    await request(app).post('/api/users/signup').send({
        email: 'test@test.com',
        password: 'password'
    }).expect(201);

    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'password'
        }).expect(200);
});


it('sets a cookie after successfull signin', async() => {
    await request(app).post('/api/users/signup').send({
        email: 'test@test.com',
        password: 'password'
    }).expect(201);

    const response = await request(app)
            .post('/api/users/signin')
            .send({
                email: 'test@test.com',
                password: 'password'
            }).expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
})