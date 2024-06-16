import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@nethtickets/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/tickets-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    //find the ticket that the order is reeserving
    //console.log("Received OrderCreated event:", data);
    const ticket = await Ticket.findById(data.ticket.id);
    //console.log("somewhere here");
    //if no ticket throw error
    if (!ticket) {
      throw new Error("ticket not found");
    }

    //Mark the ticket as being reserved by setting its orderId property
    ticket.set({ orderId: data.id });

    //save the ticket
    await ticket.save();
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      price: ticket.price,
    });

    //ack the message
    msg.ack();
  }
}
