import { Subjects, Publisher, PaymentCreatedEvent } from "@ticketsnode/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
    publish = jest.fn().mockImplementation(({}) => {
        return Promise.resolve({});
    });
}