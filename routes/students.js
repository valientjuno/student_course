const express = require("express");
const router = express.Router();

const studentController = require("../controllers/index");

router.get("/", studentController.getAllStudents);

router.get("/:id", studentController.getSingleStudent);

router.post("/", studentController.createStudent);

router.delete("/delete/:id", studentController.deleteStudent);

module.exports = router;
