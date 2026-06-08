import { processFirewallAlert } from "./playbook.controller.js";

export const logController = async (req, res) => {
    const logstashPayload = req.body;

    if (!logstashPayload.source_ip || !logstashPayload.action) {
        console.warn(`[SOAR - ENGINE] ⚠️ Received incomplete log data:`, logstashPayload);
        return res.status(400).json({ success: false, message: 'Incomplete log parameters.' });
    }

    processFirewallAlert(logstashPayload);

    res.status(202).json({ success: true, message: 'Alert received and queued for orchestration.' });
}