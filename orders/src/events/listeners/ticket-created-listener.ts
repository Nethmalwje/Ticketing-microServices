import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketCreatedEvent } from "@nethtickets/common";
import { Ticket } from "../../models/tickets";
import { queueGroupName } from "./queue-group-name";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    //we need the data from the created ticket ans save in a local collection
    const { id, title, price } = data;
    const ticket = Ticket.build({
      id,
      title,
      price,
    });
    await ticket.save(); //crerated a new ticket from the needed data and saved it locally

    msg.ack(); //Sent an ack to the vent bus
  } //['data']means of that event take a look at the data property
}
