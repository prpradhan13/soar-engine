import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import Incident from '../models/incident.model.js';
import Remediation from '../models/remediation.model.js';
import { blockIpOnFirewall } from './firewall.service.js';
import { groq } from './utils.service.js';

dotenv.config();

const ipTrafficMonitor = new Map();
const FLOOD_THRESHOLD = 20;
const TIME_WINDOW_MS = 10000;

export const analyzeThreat = async (logData) => {
    try {
        console.log(`[AI ANALYST] 🧠 Analyzing incoming telemetry for IP: ${logData.src_ip}...`);

        const response = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `You are an expert Tier-1 SOC Analyst. 
                    Your job is to analyze firewall logs and determine if an IP address should be blocked.
                    
                    Rules:
                    1. If the traffic is standard background noise (e.g., standard ping/ICMP, minor broadcast noise), action is IGNORE.
                    2. If the traffic shows signs of brute force, port scanning (many blocked ports rapidly), or known malicious signatures, action is BLOCK.
                    
                    You MUST respond in strict JSON format with exactly three keys:
                    {
                        "action": "BLOCK" or "IGNORE",
                        "confidence": <number 1-100>,
                        "reason": "<A short 1-sentence technical explanation>"
                    }`
                },
                {
                    role: "user",
                    content: `Analyze this log event from pfSense: ${JSON.stringify(logData)}`
                }
            ]
        });

        // Parse the AI's JSON response back into a JavaScript object
        const aiDecision = JSON.parse(response.choices[0].message.content);
        
        console.log(`[AI ANALYST] Decision: ${aiDecision.action} (Confidence: ${aiDecision.confidence}%) - ${aiDecision.reason}`);
        
        return aiDecision;

    } catch (error) {
        console.error(`[AI CRITICAL] OpenAI API Failed:`, error.message);
        return { action: "IGNORE", confidence: 0, reason: "AI Service Offline" };
    }
};

export const generateAIIncidentReport = async (alert) => {
    const attackerIp = alert.source_ip;

    try {
        //Is it already actively blocked?
        const isAlreadyBlocked = await Remediation.findOne({ ip_address: attackerIp, active: true });
        if (isAlreadyBlocked) return;

        //EVENT AGGREGATION & FLOOD DETECTION
        const now = Date.now();
        let stats = ipTrafficMonitor.get(attackerIp) || { count: 0, firstSeen: now };

        // if the 10-second window has expired, reset the bucket
        if (now - stats.firstSeen > TIME_WINDOW_MS) {
            stats = { count: 0, firstSeen: now };
        }

        stats.count += 1;
        ipTrafficMonitor.set(attackerIp, stats);

        // --- THE DECISION ENGINE ---
        
        // It's a massive flood! Bypass AI and auto-block immediately.
        if (stats.count === FLOOD_THRESHOLD) {
            console.log(`[SOAR - CRITICAL] 🚨 VOLUME THRESHOLD EXCEEDED (${FLOOD_THRESHOLD} logs in 10s)! Auto-blocking ${attackerIp}...`);
            
            const success = await blockIpOnFirewall(attackerIp);
            
            if (success) {
                const newIncident = await Incident.create({
                    src_ip: attackerIp,
                    protocol: alert.protocol,
                    interface: alert.interface,
                    ai_analysis: { action: "BLOCK", confidence: 100, reason: "Automated volumetric flood detection." },
                    status: "contained"
                });
                await Remediation.create({ ip_address: attackerIp, incident_id: newIncident._id });
            }
            return;
        }
        
        // already blocked them from the flood, drop extra logs
        if (stats.count > FLOOD_THRESHOLD) {
            return; 
        }

        // It's a duplicate log, but not a flood yet. Throttle it to save AI tokens.
        if (stats.count > 1 && stats.count < FLOOD_THRESHOLD) {
            return; 
        }

        const logDataForAI = {
            src_ip: alert.source_ip,
            dest_port: alert.destination_port,
            protocol: alert.protocol,
            interface: alert.interface,
            action: alert.action
        };
        const analysis = await analyzeThreat(logDataForAI);
        let finalStatus = "ignored";

        if (analysis.action === "BLOCK" && analysis.confidence >= 80) {
            console.log(`[SOAR TRIGGER] 🚨 High-confidence threat identified by AI. Deploying firewall containment...`);
            const success = await blockIpOnFirewall(attackerIp);
            finalStatus = success ? "contained" : "failed";
        }

        const newIncident = await Incident.create({
            src_ip: attackerIp,
            dest_port: alert.destination_port,
            protocol: alert.protocol,
            interface: alert.interface,
            ai_analysis: analysis,
            status: finalStatus
        });

        if (finalStatus === "contained") {
            await Remediation.create({
                ip_address: attackerIp,
                incident_id: newIncident._id
            });
            console.log(`[SOAR - DATABASE] 💾 Active block successfully tracked in MongoDB for ${attackerIp}.`);
        }

    } catch (error) {
        console.error(`[SOAR - ERROR] Orchestration pipeline failed for ${attackerIp}:`, error.message);
    }
};