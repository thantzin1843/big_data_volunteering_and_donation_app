// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";

// import { connectToDB } from "./config/db.js";
// import userRouter from "./routes/userRouter.js";
// import organizationRouter from "./routes/organizationRouter.js";
// import activityRouter from "./routes/activityRouter.js";

// dotenv.config();

// const app = express();
// const PORT = Number(process.env.PORT) || 9000;
// const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

// /* ---------- middleware ---------- */
// app.use(express.json({ limit: "10mb" }));
// app.use(
//   cors({
//     origin: FRONTEND_ORIGIN,   // not "*"
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// /* ---------- static uploads ---------- */
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// /* ---------- health ---------- */
// app.get("/api/ping", (_req, res) => res.json({ ok: true }));
// app.get("/", (_req, res) => res.send("Welcome express"));

// /* ---------- routes ---------- */
// app.use("/api/users", userRouter);
// app.use("/api/organizations", organizationRouter);
// app.use("/api/activities", activityRouter);

// /* ---------- 404 + error handlers ---------- */
// app.use((req, res) => {
//   res.status(404).json({ message: "Route not found", path: req.originalUrl });
// });

// app.use((err, _req, res, _next) => {
//   console.error("Unhandled error:", err);
//   res.status(err.status || 500).json({ message: err.message || "Server error" });
// });

// /* ---------- boot ---------- */
// await connectToDB();
// app.listen(PORT, () => {
//   console.log(`Server is listening on http://localhost:${PORT}`);
//   console.log(`CORS allowed origin: ${FRONTEND_ORIGIN}`);
// });

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import { connectToDB } from "./config/db.js";
import userRouter from "./routes/userRouter.js";
import organizationRouter from "./routes/organizationRouter.js";
import activityRouter from "./routes/activityRouter.js";
import notificationRouter from "./routes/notificationRouter.js";
import adminRouter from "./routes/adminRouter.js";
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 9000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

/* middleware */
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* static uploads */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* health */
app.get("/api/ping", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) => res.send("Welcome express"));

/* routes */
app.use("/api/users", userRouter);
app.use("/api/organizations", organizationRouter);
app.use("/api/activities", activityRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/admin", adminRouter);
/* 404 + error */
app.use((req, res) => res.status(404).json({ message: "Route not found", path: req.originalUrl }));
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

/* boot */
await connectToDB();
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`CORS allowed origin: ${FRONTEND_ORIGIN}`);
});
