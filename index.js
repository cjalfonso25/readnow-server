const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
require("dotenv").config();
require("./db/mongoose");

const posts = require("./routers/posts");
const users = require("./routers/users");

const app = express();

app.use(cors());
app.use(helmet());
app.use(cookieParser());

const PORT = process.env.PORT;

app.use(express.json());
app.use(posts);
app.use(users);

app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
