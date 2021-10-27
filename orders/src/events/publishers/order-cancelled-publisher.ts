import { Publisher, OrderCancelledEvent, Subjects } from "@ticketsnode/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
};