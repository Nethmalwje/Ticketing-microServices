import express from "express";

import { currentUser } from "@nethtickets/common";

const router = express.Router();

//this is to figure out the user is sighn in or not ,to veryfy jwt
router.get("/api/users/currentuser", currentUser, (req, res) => {
  // if (!req.session?.jwt) {
  //   return res.send({ currentUser: null });
  // }
  // try {
  //   const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!);
  //   res.send({ currentUSer: payload });
  // } catch (err) {
  //   res.send({ currentUSer: null });
  // }
  //-----we dont need these becuz middleware does this

  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
