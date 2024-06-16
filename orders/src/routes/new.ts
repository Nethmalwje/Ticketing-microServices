import express, { Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@nethtickets/common";
import { body } from "express-validator";
import mongoose from "mongoose";
import { Ticket } from "../models/tickets";
import { Order } from "../models/order";
import { OrderStatus } from "@nethtickets/common";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input)) //we arr assuming the ticket issuing db is mongo and checking for the id..this is bad practice
      .withMessage("ticket id must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    //find the ticket the user is trying to order int the db
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }
    //Make sure that this ticket is not already reserved
    //run query to look at all orders .find an order where the ticket
    //is the ticket we just found and the order status is not cancelled
    //if we find an order from that ,that means the tickert is recerved

    const isReserved = await ticket.isReserved();

    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved");
    }

    //Calculate an expiration date for this order (15 mins)
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    //Build the order and save it to db
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: ticket,
    });

    await order.save();
    //publish an event saying that an order is created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(), //this gives a UTC time stamp//mehema watenne date object ekak json unama eka nisa string karalama danawa'8384u34 :MST'
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
