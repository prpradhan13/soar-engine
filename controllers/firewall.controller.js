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
            host: '127.0.0.1',
            port: 2222,
            username: process.env.PFSENSE_UNAME,
            password: process.env.PFSENSE_PW,
            readyTimeout: 20000
        });

        // 2. The pfSense 'pfctl' syntax for dynamic tables
        // This injects the IP directly into the SOAR_ALLOW alias in live memory
        const command = `pfctl -t SOAR_ALLOW -T add ${ipAddress}`;

        // 3. Execute the command on the firewall
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