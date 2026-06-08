import express from "express";
import { allowIpOnFirewall, blockIpOnFirewall, getFirewallState } from "../controllers/firewall.controller.js";

const router = express.Router();

router.post("/allowIp", allowIpOnFirewall);
router.post("/blockIp", blockIpOnFirewall);
router.get("/status", getFirewallState);

export default router;