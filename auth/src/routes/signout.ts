import express from "express";

const router = express.Router();

router.post("/api/users/signout", (req, res) => {
  req.session = null; //dump all the data in the cookie
  res.send({});
});

export { router as signoutRouter };
