import request from "supertest";
import { app } from "../../app";

//write tests
it("returns a 201 on successful signup", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);
});

it("returns a 400 with an invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "testtest.com",
      password: "password",
    })
    .expect(400);
});
it("returns a 400 with an invalid password", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "testtest.com",
      password: "p",
    })
    .expect(400);
});

it("returns a 400 with missing email and password", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com" })
    .expect(400);
  await request(app)
    .post("/api/users/signup")
    .send({ password: "haabfbajf" })
    .expect(400);
});

it("dissallows duplicate emails", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test1@test.com", password: "password" })
    .expect(201);

  await request(app)
    .post("/api/users/signup")
    .send({ email: "test1@test.com", password: "password" })
    .expect(400);
});

//supertest does not have https connections thaths wahy this test failed
//so when testing cookiesession secure to false

it("sets a cookie after successfull signup", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  expect(response.get("Set-Cookie")).toBeDefined(); //get looks at the response headers
});
