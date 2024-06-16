import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@nethtickets/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    //calculation time
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log("waiting this many seconds to process the job: ", delay);
    await expirationQueue.add(
      { orderId: data.id },
      //adding the delay
      {
        delay,
      }
    );
    msg.ack();
  }
}
