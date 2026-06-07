import { triggerSlackAlert, blockIPAtFirewall } from "../services/firewall.service.js";

export const runIncidentPlaybook = (alert) => {
    console.log(`\n[SOAR - ENGINE] Processing incoming alert: "${alert.alert_type}"`);

    if (alert.severity === 'High' && (alert.alert_type === 'Brute Force' || alert.alert_type === 'Ransomware Activity')) {
        console.log(`[SOAR - ENGINE] Match found: High-Risk Containment Playbook triggered.`);
        triggerSlackAlert(alert);
        blockIPAtFirewall(alert.attacker_ip);
    } else if (alert.severity === 'Low') {
        console.log(`[SOAR - ENGINE] Match found: Low-Risk Logging Playbook triggered. Documenting anomaly for review.`);
    } else {
        console.log(`[SOAR - ENGINE] Alert parsed. No immediate automated containment required.`);
    }
};