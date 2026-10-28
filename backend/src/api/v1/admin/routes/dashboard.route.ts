const express = require("express");
const router = express.Router();
const controller = require("../controllers/dashboard.controller");

router.get("/", controller.index);

module.exports = router;

export {};
