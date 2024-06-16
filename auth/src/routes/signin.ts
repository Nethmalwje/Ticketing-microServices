import express, { Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "@nethtickets/common";
import { User } from "../models/user";
import { BadRequestError } from "@nethtickets/common";
import { Password } from "../services/password";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("You must apply a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const exsistingUser = await User.findOne({ email });
    if (!exsistingUser) {
      throw new BadRequestError("Invalid credentials");
    }

    const passwordMatch = await Password.compare(
      exsistingUser.password,
      password
    ); //we created this method in services
    if (!passwordMatch) {
      throw new BadRequestError("Invalid Credentials");
    }

    //genrate JWT
    const userJwt = jwt.sign(
      {
        id: exsistingUser.id,
        email: exsistingUser.email,
      },
      process.env.JWT_KEY!
      //"asdf"
    );

    //store it on the session object
    req.session = { jwt: userJwt };

    res.status(200).send(exsistingUser);
  }
);

export { router as signinRouter };
