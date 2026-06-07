import express from 'express';
import { runIncidentPlaybook } from '../controllers/webhook.controller.js';

const router = express.Router();

// Webhook endpoint
router.post('/webhook', (req, res) => {
    const alertData = req.body;

    if (!alertData.alert_type|| !alertData.attacker_ip || !alertData.severity){
        return res.status(400).json({ success: false, message: 'Invalid alert payload schema.' });
    }

    // Pass the alert data into the automation engine asynchronously
    runIncidentPlaybook(alertData);

    // Respond immediately to the sender (SIEM/Firewall) that data was received
    res.status(202).json({ success: true, message: 'Alert received and queued for orchestration.' });

});

export default router;