const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const database = require("./config/database");
const clientRoutesApiVer1 = require("./api/v1/client/routes/index.route");
const adminRoutesApiVer1 = require("./api/v1/admin/routes/index.route");
const bodyParser = require("body-parser");

database.connect();

const app = express();
const port = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(
  cors({
    origin: `${FRONTEND_URL}`,
    credentials: true,
  }),
);

app.use(cookieParser());

// parse application/json
app.use(bodyParser.json());

// Routes Version 1
clientRoutesApiVer1(app);
adminRoutesApiVer1(app);

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("--- GLOBAL ERROR ---", err);
  res.status(err.status || 400).json({
    message: err.message || "Đã xảy ra lỗi!",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
