import mongoose from "mongoose";
import { Order } from "../../../models/order";
import { ExpirationCompleteEvent, OrderStatus } from "@ticketsnode/common";
import { Ticket } from "../../../models/ticket";
import { natsClient } from "../../../nats-client";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { Message } from "node-nats-streaming";

const setup = async() => {
    const listener = new ExpirationCompleteListener(natsClient.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'adasd',
        price: 232
    });

    await ticket.save();

    const order = Order.build({
        userId: 'asfasf',
        status: OrderStatus.Created, 
        expiresAt: new Date(), 
        ticket
    });

    await order.save();

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, order, data, msg };
}

it('updates the order to cancelled', async() => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits the OrderCancel event', async() => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsClient.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse((natsClient.client.publish as jest.Mock).mock.calls[0][1]);

    expect(eventData.id).toEqual(order.id);
})

it('acks the event function', async() => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});