import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import { errorHandler } from "@nethtickets/common";
import { NotFoundError, currentUser } from "@nethtickets/common";
import mongoose from "mongoose";
import cookieSession from "cookie-session";
import { createTickerRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { indexTicketRouter } from "./routes";
import { updateTicketRouter } from "./routes/update";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);
app.use(currentUser);
app.use(createTickerRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all("*", async (req, res) => {
  //looks for the paths we dont have
  throw new NotFoundError();
});

app.use(errorHandler); //custom middleware for error handeling

export { app };
