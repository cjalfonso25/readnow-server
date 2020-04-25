const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");
const Post = require("../models/posts");
const router = express();

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
}).single("file");

router.get("/api/posts/all", async (req, res) => {
  try {
    const posts = await Post.find({});
    res.status(200).send(posts);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/api/posts", auth, async (req, res) => {
  try {
    await req.user.populate("posts").execPopulate();
    res.status(200).send(req.user.posts);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/api/posts/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const post = await Post.findOne({ _id });

    if (!post) return res.status(404).send();

    res.status(200).send(post);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/api/posts/me/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const post = await Post.findOne({ _id, owner: req.user._id });

    if (!post) return res.status(404).send();

    res.status(200).send(post);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/api/posts/:id/thumbnail", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    res.set("Content-Type", "image/jpg");
    res.send(post.thumbnail);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/api/posts", auth, async (req, res) => {
  const post = new Post({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await post.save();
    res.status(201).send(post);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.put("/api/posts/:id", auth, async (req, res) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);

  try {
    const post = await Post.findOne({ _id, owner: req.user._id });

    if (!post) return res.status(404).send();

    updates.forEach((update) => {
      post[update] = req.body[update];
    });

    await post.save();
    res.send(post);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.put(
  "/api/posts/thumbnail/:id",
  auth,
  upload,
  async (req, res) => {
    const _id = req.params.id;

    const post = await Post.findOne({ _id, owner: req.user._id });

    if (!post) return res.status(404).send();

    post.thumbnail = req.file.buffer;

    await post.save();

    res.status(200).send(req.file);
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/api/posts/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const post = await Post.findOneAndDelete({ _id, owner: req.user._id });

    if (!post) return res.status(404).send();

    res.send(post);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
