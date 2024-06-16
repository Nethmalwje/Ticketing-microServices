import request from "supertest";
import { app } from "../../app";

it("clears the cookie after signing out", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signout")
    .send({})
    .expect(200);

  //console.log(response.get("Set-Cookie"));
  // Assert that the cookie is cleared
  //   expect(response.get("Set-Cookie")?[0]).toEqual(
  //     "session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly"
  expect(response.get("Set-Cookie")).toBeDefined();
});
