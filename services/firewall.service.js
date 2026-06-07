export const triggerSlackAlert = (alert) => {
    console.log(`[SOAR - ACTIONS] 🚨 Alert sent to Slack: High severity attack detected from IP ${alert.attacker_ip}!`);
};

export const blockIPAtFirewall = (ip) => {
    console.log(`[SOAR - ACTIONS] 🛑 Firewall rule deployed: Blocking malicious traffic from IP ${ip}.`);
};