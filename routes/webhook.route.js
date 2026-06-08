import express from 'express';
import { runIncidentPlaybook } from '../controllers/webhook.controller.js';
import { processFirewallAlert } from '../controllers/playbook.controller.js';

const router = express.Router();

// Webhook endpoint
router.post('/webhook', (req, res) => {
    const logstashPayload = req.body;

    if (!logstashPayload.source_ip || !logstashPayload.action) {
        return res.status(400).json({ success: false, message: 'Incomplete log parameters.' });
    }

    processFirewallAlert(logstashPayload);

    res.status(202).json({ success: true, message: 'Alert received and queued for orchestration.' });
});

export default router;