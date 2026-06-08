import { NodeSSH } from "node-ssh";

const ssh = new NodeSSH();

export const allowIpOnFirewall = async (req, res) => {
    const { source_ip: ipAddress } = req.body;

    if (!ipAddress) {
        console.error(`[SOAR - ERROR] Missing required parameter: source_ip`);
        return false;
    }

    try {
        console.log(`[SOAR - MITIGATION] 🔓 Connecting to firewall to allow IP: ${ipAddress}...`);

        await ssh.connect({
            host: process.env.PFSENSE_HOST,
            port: process.env.PFSENSE_PORT,
            username: process.env.PFSENSE_UNAME,
            password: process.env.PFSENSE_PW,
            readyTimeout: 20000
        });

        // This injects the IP directly into the SOAR_ALLOW alias in live memory
        const command = `pfctl -t SOAR_ALLOW -T add ${ipAddress}`;

        const result = await ssh.execCommand(command);

        if (result.stderr && !result.stderr.includes('addresses added')) {
            console.error(`[SOAR - ERROR] Firewall responded with an actual error: ${result.stderr}`);
            return false;
        }

        console.log(`[SOAR - SUCCESS] ✅ Firewall rule injected successfully!`);
        // console.log(`[FIREWALL LOG]: ${result.stdout}`);

        res.status(200).json({ message: `IP ${ipAddress} allowed on firewall successfully.` });
        return true;

    } catch (error) {
        console.error(`[SOAR - CRITICAL] SSH Connection Failed:`, error.message);
        res.status(500).json({ error: 'Failed to connect to firewall or execute command.' });
        return false;
    } finally {
        ssh.dispose();
        console.log(`[SOAR - INFO] SSH connection closed.`);
    }
};

export const blockIpOnFirewall = async (req, res) => {
    const { source_ip: ipAddress } = req.body;

    if (!ipAddress) {
        console.error(`[SOAR - ERROR] Missing required parameter: source_ip`);
        return false;
    }

    try {
        console.log(`[SOAR - MITIGATION] 🔓 Connecting to firewall to block IP: ${ipAddress}...`);

        await ssh.connect({
            host: process.env.PFSENSE_HOST,
            port: process.env.PFSENSE_PORT,
            username: process.env.PFSENSE_UNAME,
            password: process.env.PFSENSE_PW,
            readyTimeout: 20000
        });

        const command = `pfctl -t SOAR_BLOCK -T add ${ipAddress}`;

        const result = await ssh.execCommand(command);

        if (result.stderr && !result.stderr.includes('addresses added')) {
            console.error(`[SOAR - ERROR] Firewall responded with an actual error: ${result.stderr}`);
            return false;
        }

        console.log(`[SOAR - SUCCESS] ✅ Firewall rule injected successfully!`);

        res.status(200).json({ message: `IP ${ipAddress} blocked on firewall successfully.` });
        return true;

    } catch (error) {
        console.error(`[SOAR - CRITICAL] SSH Connection Failed:`, error.message);
        res.status(500).json({ error: 'Failed to connect to firewall or execute command.' });
        return false;
    } finally {
        ssh.dispose();
        console.log(`[SOAR - INFO] SSH connection closed.`);
    }
};

export const getFirewallState = async (_, res) => {
    try {
        console.log(`[SOAR - AUDIT] 🔍 Fetching active memory tables from firewall...`);

        await ssh.connect({
            host: process.env.PFSENSE_HOST,
            port: process.env.PFSENSE_PORT,
            username: process.env.PFSENSE_UNAME,
            password: process.env.PFSENSE_PW,
            readyTimeout: 20000
        });

        // Fetch both tables
        const allowResult = await ssh.execCommand(`pfctl -t SOAR_ALLOW -T show`);
        const blockResult = await ssh.execCommand(`pfctl -t SOAR_BLOCK -T show`);

        // Helper function to clean pfctl output into a clean array of IPs
        const parseIPs = (rawOutput) => {
            if (!rawOutput) return [];
            return rawOutput
                .split('\n')
                .map(ip => ip.trim())
                .filter(ip => ip.length > 0); // Remove empty lines
        };
        
        const activeState = {
            allowed_ips: parseIPs(allowResult.stdout),
            blocked_ips: parseIPs(blockResult.stdout)
        };

        console.log(`[SOAR - SUCCESS] ✅ Audit complete.`);
        return res.status(200).json(activeState);

    } catch (error) {
        console.error(`[SOAR - CRITICAL] SSH Connection Failed:`, error.message);
        return { error: 'Failed to connect to firewall or execute command.' };
    } finally {
        ssh.dispose();
    }
};