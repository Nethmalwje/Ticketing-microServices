import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import {
  NotFoundError,
  validateRequest,
  requireAuth,
  NotAuthorisedError,
  BadRequestError,
} from "@nethtickets/common";
import { TicketUpdatedPublisher } from "../events/publishers/tickets-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();
router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("title is empty"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("price must be provided and must be greater tham 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.orderId) {
      throw new BadRequestError("Cannot edit a reserved Ticket");
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorisedError();
    }
    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });

    await ticket.save();
    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
