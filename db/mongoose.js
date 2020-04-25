const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost/readnow-api", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Connected to mongodb"))
  .catch((e) => console.log("error", e));
