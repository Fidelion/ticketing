import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

const client = nats.connect('ticketing', 'abs', {
    url: 'http://localhost:4222'
}); 

client.on('connect', async() => {
    console.log('Publisher connected to NATS.');

    const publisher = new TicketCreatedPublisher(client);

    await publisher.publish({
        id: '123',
        title: 'concert',
        price: 20
    });
    // const data = JSON.stringify({
    //     id: 1233,
    //     title: 'MacBook Pro',
    //     price: 299
    // });

    // client.publish('ticket:created', data, () => {
    //     console.log('Event published');
    // });
});