import mongoose from 'mongoose';

const remediationSchema = new mongoose.Schema({
    ip_address: { 
        type: String, 
        required: true,
        index: true 
    },
    action_type: { 
        type: String, 
        default: 'BLOCK' 
    },
    target_table: { 
        type: String, 
        default: 'SOAR_BLOCK' // The pfSense alias we created earlier
    },
    initiated_at: { 
        type: Date, 
        default: Date.now 
    },
    active: { 
        type: Boolean, 
        default: true // Switched to false when you manually unblock them from the dashboard
    },
    
    // Relational tie back to the exact attack that caused this block
    incident_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Incident' 
    }
});

export default mongoose.model('Remediation', remediationSchema);