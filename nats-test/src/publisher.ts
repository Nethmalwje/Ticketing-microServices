import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

console.clear();

const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
}); //client = stan uses to connect nats streaming server

stan.on("connect", async () => {
  console.log("publisher connected to nats");

  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: "123",
      title: "concert",
      price: 200,
    });
  } catch (err) {
    console.error(err);
  }

  //   const data = JSON.stringify({
  //     id: "123",
  //     title: "concert",
  //     price: 20,
  //   }); //in order to send  this we neeed to convert this into json
  //   stan.publish("ticket:created", data, () => {
  //     console.log("event published");
  //   }); //sometimes we call events as messsages in docs
});
