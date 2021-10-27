import { OrderCreatedEvent, OrderStatus } from "@ticketsnode/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsClient } from "../../../nats-client";
import { OrderCreatedListener } from "../order-created-listener"

const setup = async() => {
    //Create Listener
    const listener = new OrderCreatedListener(natsClient.client);

    //Create Ticket
    const ticket = Ticket.build({
        title: 'Concert',
        price: 323,
        userId: 'adas'
    });

    await ticket.save();

    //Create fake data object
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'asdasd',
        expiresAt: 'adasdas',
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }

    //Create fake msg object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, data, msg };
}

it('sets the userId of the ticket', async() => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);
})

it('acks the message', async() => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})

it('publishes ticket updated event', async() => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsClient.client.publish).toHaveBeenCalled();

    const ticketUpdateData = JSON.parse((natsClient.client.publish as jest.Mock).mock.calls[0][1]);

    expect(data.id).toEqual(ticketUpdateData.orderId);
});