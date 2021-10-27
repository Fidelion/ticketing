import mongoose from 'mongoose';
import { app } from './app';
import { natsClient } from './nats-client';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
    if(!process.env.JWT_KEY) {
        throw new Error('JWT Key is not definied!');
    }

    if(!process.env.MONGO_URI) {
        throw new Error('Mongo URI is not definied!');
    }

     if(!process.env.NATS_CLIENT_ID) {
        throw new Error('Mongo URI is not definied!');
    }

     if(!process.env.NATS_URL) {
        throw new Error('Mongo URI is not definied!');
    }

     if(!process.env.NATS_CLUSTER_ID) {
        throw new Error('Mongo URI is not definied!');
    }
    
    try {
        await natsClient.connect(
            process.env.NATS_CLUSTER_ID, 
            process.env.NATS_CLIENT_ID, 
            process.env.NATS_URL);

        natsClient.client.on('close', () => {
            console.log('NATS connection closed');
            process.exit();
        });

        process.on('SIGINT', () => natsClient.client.close());
        process.on('SIGTERM', () => natsClient.client.close());

        new OrderCancelledListener(natsClient.client).listen();
        new OrderCreatedListener(natsClient.client).listen();

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to db');
    } catch (err) {
        console.error(err); 
    }

    app.listen(3000, () => {
    console.log('Listening on port 3000!!!!');
    });
}

start();