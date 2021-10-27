import { Publisher, Subjects, TicketUpdatedEvent } from "@ticketsnode/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}