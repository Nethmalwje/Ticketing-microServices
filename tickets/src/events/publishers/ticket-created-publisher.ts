//emits and event to  nat streaminng serverr

import { Subjects, Publisher, TicketCreatedEvent } from "@nethtickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
