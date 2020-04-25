const jwt = require("jsonwebtoken");
const Users = require("../models/users");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "readnowblog");
    const user = await Users.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user; //assign user to req.user variable
    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate" });
  }
};

module.exports = auth;
