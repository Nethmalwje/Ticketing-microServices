import { Publisher, OrderCreatedEvent, Subjects } from "@nethtickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
