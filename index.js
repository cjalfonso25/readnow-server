const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
require("dotenv").config();
require("./db/mongoose");

const posts = require("./routers/posts");
const users = require("./routers/users");

const app = express();

app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const PORT = process.env.PORT;

app.use(express.json());
app.use(posts);
app.use(users);

app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
