import { OrderStatus } from "@ticketsnode/common";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { Payment } from "../../models/payment";
import { stripe } from "../../stripe";


// process.env.STRIPE_KEY = "sk_test_51GcSvuCyYW8raZL5Yu93gSmqLH7S3TT4zyMhtzgU0ot6zAo9e0XRJNz1ZiLIXcvApsrxJMHTjQ0NpFykLvv4tjSQ0088k88eOa";

it('returns 404 when purchasing an order that does not exist', async() => {
    await request(app).post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'afsasfa',
            orderId: new mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);
});

it('returns 401 when trying to pay the order that does not belong to the user', async() => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        price: 20
    });

    await order.save();
    
    await request(app).post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'afsasfa',
            orderId: order.id
        })
        .expect(401);
});

it('returns 400 error when trying to purchase an order that has been cancelled', async() => {
    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
            id: new mongoose.Types.ObjectId().toHexString(),
            userId,
            version: 0,
            status: OrderStatus.Cancelled,
            price: 20
        });    

    await order.save();

    await request(app).post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'afsasfa',
            orderId: order.id
        })
        .expect(400);
});

it('returns a 201 when adding a payment', async() => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
            id: new mongoose.Types.ObjectId().toHexString(),
            userId,
            version: 0,
            status: OrderStatus.Created,
            price
        });   

    await request(app).post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        }).expect(201);
    
    const stripeCharges = await stripe.charges.list({
        limit: 50
    });

    const stripeCharge = stripeCharges.data.find(charge => {
        return charge.amount === price * 100
    });

    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual('usd');

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id
    });

    expect(payment).not.toBeNull();
})