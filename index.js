import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { connectDb } from "./Db/index.js";
import { router } from "./routes/auth.js";
import { postRouter } from "./routes/post.js";
import cookieParser from "cookie-parser";
import { userRoute } from "./routes/user.routes.js";


dotenv.config();

const port = process.env.PORT || 3000;

const app = express();

app.use(
  cors({
    origin: "https://social-hub-frontend.vercel.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

connectDb();
app.get("/", (req, res) => {
  res.send("hello I am Working ");
});

app.use("/api", router);
app.use("/api", postRouter);
app.use("/api", userRoute);
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
