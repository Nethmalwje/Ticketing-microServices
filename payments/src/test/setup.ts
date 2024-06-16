import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../app";
import request from "supertest";
import jwt from "jsonwebtoken";

// telling TypeScript there is a signup global property

// declare global {
//   namespace NodeJS {
//     interface Global {
//       signin(): Promise<string[]>;
//     }
//   }
// }

// global.d.ts
declare global {
  function signin(id?: string): string[];
}

jest.mock("../nats-wrapper");

process.env.STRIPE_KEY =
  "sk_test_51PReh9Kmk5jiEBsucmdhj9wfJRpmYp3hvJo7GmcLhmGZMQEs6OnfaUvFqYHoJiGDF8ZCb9rAzM2vloF5z4VhS64i00cnjimFO5";

//to create an inmemory instance of mongodb
//hook to run before all of our tests
let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = "asdafasdf";
  mongo = await MongoMemoryServer.create();
  // mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(
    mongoUri
    //     {
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true,    ---already set to true in new version
    //   }
  );
});

//config hook run before each of our tests

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

//after running test stop inmemery server

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

//globally scope function to sighn in

global.signin = (id?: string) => {
  //build a JWT payload {id ,email}
  const payload = {
    // id: "12jnfdns", //anything is ok
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };
  //create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  //build the session Object {jwt : MY_JWT}
  const session = { jwt: token };
  //turn that session into JSON
  const sessionJSON = JSON.stringify(session);
  //take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");
  //return a string  thats thr cookie with the encoded data
  return [`session=${base64}`];
};
