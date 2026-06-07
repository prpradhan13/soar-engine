import express from "express";
import { allowIpOnFirewall } from "../controllers/firewall.controller.js";

const router = express.Router();

router.post("/allowIp", allowIpOnFirewall);

export default router;