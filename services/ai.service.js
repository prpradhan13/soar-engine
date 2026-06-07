import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateAIIncidentReport = (alert) => {
    // console.log(`[SOAR - AI LAYER] 🧠 True Threat Confirmed. Initializing LLM context to analyze external asset...`);
    
    // // This is where your future OpenAI / Ollama SDK call will sit
    // const mockAIReport = {
    //     summary: `External IP ${alert.source_ip} targeted internal asset ${alert.destination_ip} on port ${alert.destination_port} using ${alert.protocol.toUpperCase()}.`,
    //     mitigation: "Maintain the firewall block rule. Cross-reference source IP against active malicious botnet feeds.",
    //     mitre_mapping: alert.destination_port === '22' ? "T1021.004 (SSH Remote Services)" : "T1046 (Network Service Scanning)"
    // };

    // console.log(`[SOAR - AI LAYER] ✨ Threat Report Generated Successfully:`);
    // console.log(JSON.stringify(mockAIReport, null, 2));
    // console.log(`[SOAR - DATABASE] Logged incident card to dashboard database storage.`);
    console.log(`[SOAR - AI LAYER] 🧠 Threat logged. Writing to local file...`);
    
    // 1. Define the path to your fake database file
    const dbPath = path.join(__dirname, '../tmp/database.json');

    // 2. Read the existing file (or create an empty array if it doesn't exist)
    let logs = [];
    if (fs.existsSync(dbPath)) {
        const rawData = fs.readFileSync(dbPath, 'utf8');
        logs = JSON.parse(rawData);
    }

    // 3. Push the new alert into the array
    logs.push(alert);

    // 4. Write the entire array physically back to the hard drive
    fs.writeFileSync(dbPath, JSON.stringify(logs, null, 2));

    console.log(`[SOAR - DATABASE] Successfully saved incident to database.json`);
};