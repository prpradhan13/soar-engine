import ipRangeCheck from 'ip-range-check';
import { allowList as CORPORATE_ALLOWLIST } from '../services/utils.service.js';
import { sendUnblockCommandToFirewall } from '../services/firewall.service.js';
import { generateAIIncidentReport } from '../services/ai.service.js';

export const processFirewallAlert = async (alert) => {
    const attackerIp = alert.source_ip;

    // console.log(`\n[SOAR - ENGINE] 📥 New log received from Logstash. Analyzing traffic from: ${attackerIp}`);

    const isInternalAsset = ipRangeCheck(attackerIp, CORPORATE_ALLOWLIST);

    if (isInternalAsset) {
        sendUnblockCommandToFirewall(attackerIp, alert.interface);
    } else {
        generateAIIncidentReport(alert);
    }
};