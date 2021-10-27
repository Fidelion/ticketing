import { Publisher, OrderCreatedEvent, Subjects } from "@ticketsnode/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
};