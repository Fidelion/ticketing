import request from "supertest";
import { app } from "../../app";

it("returns 201 on signup", async() => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: "pass2123"
        }).expect(201);
});

it("returns 400 with bad email", async() => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: "test",
            password: "pass2123"
        }).expect(400);
});

it("returns 400 with bad password", async() => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: "12"
        }).expect(400);
});


it("returns 400 without email and password", async() => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com"
        }).expect(400);

    await request(app)
        .post('/api/users/signup')
        .send({
            password: 'pass123'
        }).expect(400);
});


it("dissalows duplicate emails", async() => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: "pass123"
        }).expect(201);

    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: "pass123"
        }).expect(400);
});


it('sets a cookie after successfull signup', async() => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: "pass123"
        }).expect(201);

    expect(response.get('Set-Cookie')).toBeDefined();
});