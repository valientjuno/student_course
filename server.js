const express = require("express");
const cors = require("cors");
const mongodb = require("./db/connect");

const app = express();
const PORT = process.env.PORT || 3007;

app
  .use(cors())
  .use(express.json())
  .use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  })
  .use("/", require("./routes"));

mongodb.initDb((err) => {
  if (err) {
    console.log(err);
  } else {
    app.listen(PORT);
    console.log(
      "\x1b[32m%s\x1b[0m",
      `Connected to DB and listening on port: ${PORT}`
    );
  }
});
