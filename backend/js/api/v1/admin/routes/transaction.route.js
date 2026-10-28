"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const controller = require("../controllers/transaction.controller");
router.get("/", controller.index);
router.get("/:id", controller.detail);
module.exports = router;
