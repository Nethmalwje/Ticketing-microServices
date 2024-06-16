import mongoose, { set } from "mongoose";
import { Ticket } from "../../../models/tickets";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedEvent } from "@nethtickets/common";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { Message } from "node-nats-streaming";

const setup = async () => {
  //create a listner
  const listener = new TicketUpdatedListener(natsWrapper.client);
  //create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });

  await ticket.save();
  //create a data obj
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "new concert",
    price: 999,
    userId: "121322sf",
  };
  //create a msg obj

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  //return all the stuff

  return { msg, data, ticket, listener };
};

it("finds,updates and save the ticket", async () => {
  const { msg, data, ticket, listener } = await setup();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});
it("acks the msg", async () => {
  const { listener, data, msg } = await setup();
  //call the onMessage function with the data obj + message obj
  await listener.onMessage(data, msg);
  //write asertions to make sure ack was called
  expect(msg.ack).toHaveBeenCalled();
});

it("does nnot call ack if the event has a skipped a vesrion number", async () => {
  const { listener, data, msg, ticket } = await setup();
  data.version = 10;
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
