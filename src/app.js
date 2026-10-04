const express = require("express");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const app = express();
app.set("trust proxy", 1);
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { apiRateLimiter } = require("./middleware/rateLimiter");
const { corsOrigins, isProduction } = require("./config/env");
const healthRoutes = require("./routes/healthRoutes");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health endpoints stay lightweight and are intentionally available without authentication.
app.use("/health", healthRoutes);

app.use(helmet());

app.use(cors({
  origin: corsOrigins,
  credentials: corsOrigins !== "*",
}));

app.use(morgan(isProduction ? "combined" : "dev"));

app.use(apiRateLimiter);

app.use(express.json({ limit: "1mb" }));

app.use("/", routes);

app.use(errorHandler);

module.exports = app;
