/* eslint-disable no-console */
import { type Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/configs/envConfig";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log(`Connected To DB...!`);

    server = app.listen(envVars.PORT, () => {
      console.log(`Server is listening to port ${envVars.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  startServer();
})();

// unhandled rejection error handler
process.on("unhandledRejection", (err) => {
  console.log("unhandled rejection detected... server shutting down... ", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// uncaught exception error handler
process.on("uncaughtException", (err) => {
  console.log("uncaught exception detected... server shutting down... ", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// signal termination handler
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received... server shutting down... ");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});