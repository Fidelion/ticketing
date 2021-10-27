import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const authCookie = async () => {
    //Build a JWT payload. { id, email}
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'email@test.com'
    }
    //Create the JWT!
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    //Build session Object. { jwt: MY_JWT }
    const session = { jwt: token };

    //Turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    //take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    //return a string that's the cookie with the encoded data
    return [`express:sess=${base64}`];
}