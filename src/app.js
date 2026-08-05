const express = require("express");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

app.use(helmet());

app.use(cors());

app.use(morgan("dev"));

app.use(express.json());

app.use("/", routes);

app.use(errorHandler);

module.exports = app;