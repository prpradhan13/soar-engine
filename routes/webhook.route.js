import express from 'express';
import { logController } from '../controllers/webhook.controller.js';

const router = express.Router();

// Webhook endpoint
router.post('/webhook', logController);

export default router;