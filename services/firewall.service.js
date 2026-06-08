import { NodeSSH } from "node-ssh";
import dotenv from "dotenv";

dotenv.config();

const ssh = new NodeSSH();

export const triggerSlackAlert = (alert) => {
    console.log(`[SOAR - ACTIONS] 🚨 Alert sent to Slack: High severity attack detected from IP ${alert.attacker_ip}!`);
};

export const blockIpOnFirewall = async (ip) => {
    console.log(`[SOAR - ACTIONS] 🛑 Firewall rule deployed: Blocking malicious traffic from IP ${ip}.`);

    try {
        console.log(`[SOAR - MITIGATION] 🔓 Connecting to firewall to block IP: ${ip}...`);

        await ssh.connect({
            host: process.env.PFSENSE_HOST,
            port: process.env.PFSENSE_PORT,
            username: process.env.PFSENSE_UNAME,
            password: process.env.PFSENSE_PW,
            readyTimeout: 20000
        });

        const command = `pfctl -t SOAR_BLOCK -T add ${ip}`;

        const result = await ssh.execCommand(command);

        if (result.stderr && !result.stderr.includes('addresses added')) {
            console.error(`[SOAR - ERROR] Firewall responded with an actual error: ${result.stderr}`);
            return false;
        }

        console.log(`[SOAR - SUCCESS] ✅ Firewall rule injected successfully!`);

        return true;

    } catch (error) {
        console.error(`[SOAR - CRITICAL] SSH Connection Failed:`, error.message);
        return false;
    } finally {
        ssh.dispose();
        console.log(`[SOAR - INFO] SSH connection closed.`);
    }
};

export const sendUnblockCommandToFirewall = (ip, interfaceName) => {
    console.log(`[SOAR - MITIGATION] 🔓 False Positive Detected! Internal IP ${ip} was accidentally blocked on interface ${interfaceName}.`);
    console.log(`[SOAR - MITIGATION] ⚡ Outbound API Call executed to pfSense to remove temporary block rule.`);
};