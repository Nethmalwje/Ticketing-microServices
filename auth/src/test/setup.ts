import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../app";
import request from "supertest";

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
  function signin(): Promise<string[] | undefined>;
  //var someVariable: string;
}

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

global.signin = async () => {
  const email = "test@test.com";
  const password = "password";

  const response = await request(app)
    .post("/api/users/signup")
    .send({ email, password })
    .expect(201);

  // Extract the cookie from the response
  const cookie = response.get("Set-Cookie");
  return cookie;
};
