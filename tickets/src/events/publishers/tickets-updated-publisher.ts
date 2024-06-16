//emits and event to  nat streaminng serverr

import { Subjects, Publisher, TicketUpdatedEvent } from "@nethtickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
