import express from "express";
import dotenv from "dotenv";
import webhookRoute from "./routes/webhook.route.js";

dotenv.config();

const app = express();
app.use(express.json());

// Routes Declaration
app.use("/api/v1/alerts", webhookRoute);


const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`SOAR Automation Engine active at http://localhost:${PORT}`);
});

