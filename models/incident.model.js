import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
    timestamp: { 
        type: Date, 
        default: Date.now,
        index: true
    },
    src_ip: { 
        type: String, 
        required: true,
        index: true
    },
    dest_port: { type: String },
    protocol: { type: String },
    interface: { type: String },
    
    ai_analysis: {
        action: { type: String, enum: ['BLOCK', 'IGNORE'] },
        confidence: { type: Number },
        reason: { type: String }
    },
        
    // The final result of the playbook execution based on AI's recommendation and whether the firewall block succeeded
    status: { 
        type: String, 
        enum: ['contained', 'ignored', 'failed'],
        required: true 
    }
});

export default mongoose.model('Incident', incidentSchema);