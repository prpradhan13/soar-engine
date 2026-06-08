import express from "express";
import dotenv from "dotenv";
import webhookRoute from "./routes/webhook.route.js";
import firewallRoute from "./routes/firewall.route.js";
import { connectDB } from "./config/db.js";
import dns from "node:dns/promises";

dns.setServers(["1.1.1.1", "0.0.0.0"]);

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

// Routes Declaration
app.use("/api/v1/alerts", webhookRoute);
app.use("/api/v1/firewall", firewallRoute);

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`SOAR Automation Engine active at http://localhost:${PORT}`);
});

