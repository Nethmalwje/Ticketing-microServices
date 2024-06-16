import { randomBytes } from "crypto";
import nats from "node-nats-streaming";
import { TicketCreatedListner } from "./events/ticket-created-listner";

console.clear();

const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
}); //client = stan uses to connect nats streaming server

stan.on("connect", () => {
  console.log("listner conected to nats");

  stan.on("close", () => {
    console.log("NATS connection closed");
    process.exit();
  });

  // const options = stan
  //   .subscriptionOptions()
  //   .setManualAckMode(true)
  //   .setDeliverAllAvailable()
  //   .setDurableName("order-service"); //.setManualAckMode().setDeliverAllAvailable()//chain krl thama options dana one

  // const subscription = stan.subscribe(
  //   "ticket:created", //name of the chanel
  //   "orders-service-queue-group", //queue group name
  //   options
  // );

  // subscription.on("message", (msg: Message) => {
  //   //console.log("message recived");
  //   const data = msg.getData();
  //   if (typeof data === "string") {
  //     console.log(`recived event #${msg.getSequence()},with data: ${data}`);
  //   }
  //   msg.ack();
  // });

  new TicketCreatedListner(stan).listen();
});
process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
