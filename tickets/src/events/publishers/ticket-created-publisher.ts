import { Publisher, Subjects, TicketCreatedEvent } from "@ticketsnode/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}