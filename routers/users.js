const express = require("express");
const multer = require("multer");
const router = express();
const Users = require("../models/users");
const auth = require("../middleware/auth");

// All users
router.get("/api/users", auth, async (req, res) => {
  try {
    const users = await Users.find({});
    res.status(200).send(users);
  } catch (e) {
    res.status(400).send();
  }
});

router.get("/api/users/author/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await Users.findOne({ _id });
    const author = {
      name: user.name,
      title: user.title,
      about: user.about,
      avatar: user.avatar,
      social: {
        facebook: user.facebook,
        twitter: user.twitter,
        instagram: user.instagram,
      },
    };

    res.status(200).send(author);
  } catch (e) {
    res.status(400).send();
  }
});

router.post("/api/users", async (req, res) => {
  try {
    const user = new Users(req.body);

    await user.save();

    //generate token for newly registered user
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/api/users/login", async (req, res) => {
  try {
    const user = await Users.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();

    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

router.post("/api/users/logout", auth, async (req, res) => {
  try {
    //req.user is from auth middleware
    req.user.tokens = req.user.tokens.filter((token) => {
      return req.token !== token.token;
    });

    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/api/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];

    req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// User's Profile
router.get("/api/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.patch("/api/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "name",
    "title",
    "email",
    "about",
    "password",
    "facebook",
    "twitter",
    "instagram",
    "isAdmin",
    "avatar",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updateee!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.status(200).send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/api/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(400).send();
  }
});

// User's Avatar
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.endsWith(".jpg")) {
      cb(new Error("Please upload a JPG file."));
    }

    cb(undefined, true);
  },
}).single("avatar");

router.post("/api/users/me/avatar", auth, upload, async (req, res) => {
  try {
    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.status(201).send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/api/users/me/avatar", async (req, res) => {
  try {
    res.status(200).send(req.body);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/api/users/:id/avatar", async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);

    if (!user) return res.status(404).send();

    res.set("Content-Type", "image/jpg");
    res.status(200).send(user.avatar);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
