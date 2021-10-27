import { Ticket } from "../../../models/ticket";
import { natsClient } from "../../../nats-client";
import { TicketUpdatedListener } from "../ticket-updated-event";
import mongoose from "mongoose";
import { TicketUpdatedEvent } from "@ticketsnode/common";
import { Message } from "node-nats-streaming";

const setup = async() => {
    //Create listener
    const listener = new TicketUpdatedListener(natsClient.client);

    //Create and save ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Concert',
        price: 232
    });

    await ticket.save();

    //Create fake data object
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'New Concert',
        price: 2333,
        userId: 'asdas'
    };

    //Create fake msg object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    //Return all of above
    return { listener, ticket, data, msg }
}

it('finds, saves, updates ticket', async() => {
    const { listener, data, msg, ticket } = await setup();

    listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('calls ack function', async() => {
    const { listener, data, msg, ticket } = await setup();

    listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack function of data version is not appropriate match', async() => {
    const { listener, data, msg, ticket } = await setup();
    
    data.version = 10;

    try {
        listener.onMessage(data, msg);
    } catch (err) {
        
    }

    expect(msg.ack).not.toHaveBeenCalled();
})