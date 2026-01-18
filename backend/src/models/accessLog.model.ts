import mongoose, { Schema, Document } from 'mongoose';

export interface IAccessLog extends Document {
    did: string;
    service: string;
    action: string;
    status: 'Approved' | 'Revoked' | 'Denied';
    timestamp: Date;
    metadata?: Record<string, any>;
}

const AccessLogSchema = new Schema<IAccessLog>(
    {
        did: {
            type: String,
            required: true,
            index: true
        },
        service: {
            type: String,
            required: true
        },
        action: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['Approved', 'Revoked', 'Denied'],
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        metadata: {
            type: Map,
            of: String
        }
    },
    {
        timestamps: true
    }
);

export const AccessLogModel = mongoose.model<IAccessLog>('AccessLog', AccessLogSchema);
