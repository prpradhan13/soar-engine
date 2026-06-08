import Groq from 'groq-sdk';
import ipRangeCheck from 'ip-range-check';
import dotenv from 'dotenv';

dotenv.config();

export const allowList = ['192.168.1.0/24'];

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
