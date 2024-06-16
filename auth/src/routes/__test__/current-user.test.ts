import request from "supertest";
import { app } from "../../app";

it("responds with details about the current user", async () => {
  // Sign up to create a user and get the cookie
  const cookie = (await global.signin())?.[0]; // Nullish coalescing operator
  if (!cookie) {
    throw new Error("Cookie is not defined");
  }
  // Use the cookie to get the current user
  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  // Log the response body
  //console.log(response.body);

  // Add assertions as needed
  expect(response.body.currentUser.email).toEqual("test@test.com");
});

//supertest does not manage cookies for us automiatcially

it("response with null if not authenticated", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
