const routes = require("express").Router();
const { required } = require("nodemon/lib/config");
const myController = require("../controllers/index");

routes.get("/", myController.awesomeFunction);
routes.get("/ttech", myController.tooeleTech);

routes.use("/students", require("./students"));

routes.use("/auth", require("./auth"));

routes.use("/myRoute", myController.myRoute);

module.exports = routes;
