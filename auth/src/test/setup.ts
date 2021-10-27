import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongodb: any;


beforeAll(async () => {
    process.env.JWT_KEY = 'asdsasd';
    mongodb = await MongoMemoryServer.create();
    const mongoUri = mongodb.getUri();

    await mongoose.connect(mongoUri);
});


beforeEach(async() => {
    const collections = await mongoose.connection.db.collections();

    for(let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async() => {
    await mongodb.stop();
    await mongoose.connection.close();
});
