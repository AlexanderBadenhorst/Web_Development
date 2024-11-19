import express from "express";
import cors from "cors";
import movies from "./api/movies.route.js";

//initialize express
const app = express();
//enable CORS
app.use(cors());
app.use(express.json());
//base of our url
app.use("/api/v1/movies", movies);
//error handling (unknown paths)
app.use("*", (req, res) => {
  res.status(404).json({ error: "not found" });
});

export default app;
