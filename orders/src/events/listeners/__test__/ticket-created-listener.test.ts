import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedEvent } from "@nethtickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/tickets";

const setup = async () => {
  //create an instance of the lsitener
  const listener = new TicketCreatedListener(natsWrapper.client);
  //create a fake data event
  const data: TicketCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  //create a fake msg object

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("creates and sves a  ticket", async () => {
  const { listener, data, msg } = await setup();
  //call the onMessage function with the data obj + message obj
  //write asertions to make sure a ticket was created
  await listener.onMessage(data, msg);
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("ACKS the message ", async () => {
  const { listener, data, msg } = await setup();
  //call the onMessage function with the data obj + message obj
  await listener.onMessage(data, msg);
  //write asertions to make sure ack was called
  expect(msg.ack).toHaveBeenCalled();
});
