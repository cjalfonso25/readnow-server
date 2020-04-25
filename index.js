const express = require("express");
require("./db/mongoose");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const posts = require("./routers/posts");
const users = require("./routers/users");

const app = express();

app.use(cors());
app.use(helmet());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(posts);
app.use(users);

app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
