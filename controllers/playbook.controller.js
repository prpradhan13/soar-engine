import ipRangeCheck from 'ip-range-check';
import { allowList as CORPORATE_ALLOWLIST } from '../services/utils.service.js';
import { sendUnblockCommandToFirewall } from '../services/firewall.service.js';
import { generateAIIncidentReport } from '../services/ai.service.js';

export const processFirewallAlert = (alert) => {
    const attackerIp = alert.source_ip;

    console.log(`\n[SOAR - ENGINE] 📥 New log received from Logstash. Analyzing traffic from: ${attackerIp}`);

    const isInternalAsset = ipRangeCheck(attackerIp, CORPORATE_ALLOWLIST);

    if (isInternalAsset) {
        // It's a false positive -> override the firewall block immediately
        sendUnblockCommandToFirewall(attackerIp, alert.interface);
    } else {
        // It's a legitimate external threat -> analyze it with AI
        generateAIIncidentReport(alert);
    }
};