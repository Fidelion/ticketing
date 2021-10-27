import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../ticket";

it('implements optimistic concurrency control', async() => {
    //Create ticket
    const ticket = Ticket.build({
        userId: 'abc123',
        title: 'Concert',
        price: 323
    });
    //Save ticket to db
    await ticket.save();

    //fetch ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    //make two changes to fetched tickets
    firstInstance!.set({ price: 10 });
    secondInstance!.set({ price: 15 });

    //save the first fetched ticket
    await firstInstance!.save();

    //save the second one and expect an error
    try {
        await secondInstance!.save();
    } catch (err) {
        return;
    }

    throw new Error('Should not reach this point.');
});

it('increments version number after each save', async() => {
    const ticket = Ticket.build({
        title: 'Concert',
        price: 232,
        userId: '123'
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);
});
