const express = require("express");
const router = express.Router();
const controller = require("../controllers/transaction.controller");

router.get("/", controller.index);
router.get("/:id", controller.detail);

module.exports = router;

export {};
