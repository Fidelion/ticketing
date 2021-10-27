import mongoose from "mongoose";
import { OrderCreatedEvent, OrderStatus } from "@ticketsnode/common";
import { natsClient } from "../../../nats-client"
import { OrderCreatedListener } from "../order-created-listener"
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";

const setup = async() => {
    const listener = new OrderCreatedListener(natsClient.client);

    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: 'asfasf',
        version: 0,
        expiresAt: 'fasf',
        status: OrderStatus.Created,
        ticket: {
            id: 'afasf',
            price: 20
        }
    };
    
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg }
}

it('replicates order info', async() => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);

    expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async() => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})