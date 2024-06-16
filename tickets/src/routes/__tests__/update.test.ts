import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { response } from "express";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

const createTicket = () => {
  return request(app).post("/api/tickets").set("Cookie", global.signin()).send({
    title: "fjbfdf",
    price: 20,
  });
};

it("returns a 404 if the provided id does not exsist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "sdds",
      price: 20,
    })
    .expect(404);
});
it("returns a 401 if the user is not aauthrnticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    //.set("Cookie", global.signin())
    .send({
      title: "sdds",
      price: 20,
    })
    .expect(401);
});
it("returns a 401 if the user does not own the ticket", async () => {
  const response = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", global.signin())
    .send({
      title: "sdds",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "sfsfaf",
      price: 10,
    })
    .expect(401);
});
it("returns a 400 if the provided title and price is invalid", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", cookie)
    .send({
      title: "sdds",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "adadad",
      price: -20,
    })
    .expect(400);
});
it("update the tickets provided vqlid inputs", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", cookie)
    .send({
      title: "sdds",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "1234",
      price: 200,
    })
    .expect(200);
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send({});
  expect(ticketResponse.body.title).toEqual("1234");
  expect(ticketResponse.body.price).toEqual(200);
});

it("publishes update an event ", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", cookie)
    .send({
      title: "sdds",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "1234",
      price: 200,
    })
    .expect(200);
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send({});
  expect(ticketResponse.body.title).toEqual("1234");
  expect(ticketResponse.body.price).toEqual(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects update if the ticket is reserved", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", cookie)
    .send({
      title: "sdds",
      price: 20,
    });
  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "1234",
      price: 200,
    })
    .expect(400);
});
