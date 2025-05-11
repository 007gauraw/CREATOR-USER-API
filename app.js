import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { verifyToken } from "./middleware/authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import textEnhancerRouter from "./routes/textEnhancerRoute.js";
import textToImagesRouter from "./routes/imageGeneratorRoute.js";
import videoRouter from "./routes/videoRoute.js";

const app = express();

// Configure CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Public routes
app.use("/", indexRouter);

// Protected routes with token verification
// All routes require basic OpenID scopes

app.use("/users", verifyToken, usersRouter);
app.use("/textEnhancer", verifyToken, textEnhancerRouter);
app.use("/images", verifyToken, textToImagesRouter);
app.use("/videos", verifyToken, videoRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
