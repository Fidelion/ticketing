import { OrderCancelledEvent, OrderStatus } from "@ticketsnode/common";
import mongoose from "mongoose";
import { Order } from "../../../models/order";
import { natsClient } from "../../../nats-client"
import { OrderCancelledListener } from "../order-cancelled-listener"

const setup = async() => {
    const listener = new OrderCancelledListener(natsClient.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'asfasf',
        price: 20
    });
    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'asfasf'
        }
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, order, data, msg };
}

it('updates the order status', async() => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async() => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});