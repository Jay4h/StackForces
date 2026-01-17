import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
    globalDID: string;
    serviceName: string;
    pairwiseDID: string;
    requestedFields: string[];
    sharedFields: string[];
    userConsent: boolean;
    timestamp: Date;
    sessionId: string;
    ipAddress?: string;
    userAgent?: string;
}

const AuditLogSchema = new Schema<IAuditLog>({
    globalDID: {
        type: String,
        required: true,
        index: true
    },
    serviceName: {
        type: String,
        required: true,
        enum: ['health', 'agriculture', 'smartcity'],
        index: true
    },
    pairwiseDID: {
        type: String,
        required: true,
        index: true
    },
    requestedFields: [{
        type: String,
        required: true
    }],
    sharedFields: [{
        type: String,
        required: true
    }],
    userConsent: {
        type: Boolean,
        required: true,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    sessionId: {
        type: String,
        required: true
    },
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true,
    collection: 'consent_history'
});

// Compound index for efficient queries
AuditLogSchema.index({ globalDID: 1, timestamp: -1 });
AuditLogSchema.index({ serviceName: 1, timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
