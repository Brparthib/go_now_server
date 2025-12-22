import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { router } from "./app/routes";

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = ["http://localhost:3000"];
      if (!origin || allowed.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use("/api/v1", router);

app.get("/", (_, res) => res.send("Welcome to travel-buddy"));

// app.use(globalErrorHandler);
// app.use(notFound);

export default app;
