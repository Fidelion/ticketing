import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
    console.log("Starting up....");
    if(!process.env.JWT_KEY) {
        throw new Error('JWT Key is not definied!');
    }

    if(!process.env.MONGO_URI) {
        throw new Error('Mongo URI is not definied!');
    }
    
    try {
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