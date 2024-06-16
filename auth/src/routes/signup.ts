import express, { Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../models/user";
import jwt from "jsonwebtoken";

import { validateRequest } from "@nethtickets/common";
import { BadRequestError } from "@nethtickets/common";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 charancters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   throw new RequestValidationError(errors.array());
    //   //return res.status(400).send(errors.array()); //errors.array converts errors object to  an array
    //   //throw new Error("invalid email or password");
    // }

    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // console.log("Email in use");
      // return res.send({});
      throw new BadRequestError("Email already in use");
    }

    const user = User.build({ email, password });
    await user.save();

    //genrate JWT
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
      //"asdf"
    );

    //store it on the session object
    req.session = { jwt: userJwt };

    res.status(201).send(user); //change this fot the test
  }
);

export { router as signupRouter };

//we need to check the email and password are valid or not
// if (!email || typeof email !== "string") {
//   res.status(400).send('provide a valid email')
// }
//we can use a library instead of this
