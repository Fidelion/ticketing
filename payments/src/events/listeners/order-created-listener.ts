import { Listener, OrderCreatedEvent, Subjects } from "@ticketsnode/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;

    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const order = Order.build({
            id: data.id,
            status: data.status,
            price: data.ticket.price,
            version: data.version,
            userId: data.userId
        });

        await order.save();

        msg.ack();
    }
}