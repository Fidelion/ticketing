import { Message } from "node-nats-streaming";
import { TicketCreatedEvent } from "@ticketsnode/common";
import { TicketCreatedListener } from "../ticket-created-listener";
import { natsClient } from "../../../nats-client";
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";

const setup = async() => {
    //create an instance of listener
    const listener = new TicketCreatedListener(natsClient.client);

    //create a fake data event
    const data: TicketCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        title: 'Concert 23',
        price: 323,
        userId: new mongoose.Types.ObjectId().toHexString()
    }

    //create a fake message object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg }; 
}

it('creates and saves ticket', async() => {
    const { listener, data, msg } = await setup();

    //call the onMessage function with data and message properties
    await listener.onMessage(data, msg);

    //write assertions to check if ticket was created
    const ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
});


it('acks the message', async() => {
    const { listener, data, msg } = await setup();

    //call the onMessage function with data and message properties
    await listener.onMessage(data, msg);

    //write assertions to check if ack function was called
    expect(msg.ack).toHaveBeenCalled();
})