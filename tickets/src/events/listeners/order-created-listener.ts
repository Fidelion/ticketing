import { Listener, OrderCreatedEvent, Subjects } from "@ticketsnode/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;

    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        //Find The ticket
        const ticket = await Ticket.findById(data.ticket.id);

        //If no Ticket, throw error
        if(!ticket) {
            throw new Error('No Ticket Found');
        }

        //Update Ticket order id
        ticket.set({ orderId: data.id });

        //Save Ticket
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId,
        });

        //Call ack to acknowledge event
        msg.ack();
    }
}