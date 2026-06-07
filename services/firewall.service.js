export const triggerSlackAlert = (alert) => {
    console.log(`[SOAR - ACTIONS] 🚨 Alert sent to Slack: High severity attack detected from IP ${alert.attacker_ip}!`);
};

export const blockIPAtFirewall = (ip) => {
    console.log(`[SOAR - ACTIONS] 🛑 Firewall rule deployed: Blocking malicious traffic from IP ${ip}.`);
};

export const sendUnblockCommandToFirewall = (ip, interfaceName) => {
    console.log(`[SOAR - MITIGATION] 🔓 False Positive Detected! Internal IP ${ip} was accidentally blocked on interface ${interfaceName}.`);
    console.log(`[SOAR - MITIGATION] ⚡ Outbound API Call executed to pfSense to remove temporary block rule.`);
};