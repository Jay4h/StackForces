import mongoose, { Schema, Document } from 'mongoose';

export interface IHealthRecord extends Document {
    did: string; // The Global DID (owner)
    pairwiseDID: string; // The specific pairwise DID for health portal
    type: string; // e.g., "Lab Report", "Prescription"
    title: string;
    doctor: string;
    hospital: string;
    date: string;
    description?: string;
    data: Record<string, any>; // Encrypted or raw data fields
    timestamp: Date;
}

const HealthRecordSchema = new Schema<IHealthRecord>(
    {
        did: { type: String, required: true, index: true },
        pairwiseDID: { type: String, required: true, index: true },
        type: { type: String, required: true },
        title: { type: String, required: true },
        doctor: { type: String, required: true },
        hospital: { type: String, required: true },
        date: { type: String, required: true },
        description: { type: String },
        data: { type: Map, of: Schema.Types.Mixed }, // Flexible data structure
        timestamp: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

// ========================================
// PRODUCTION INDEXES
// ========================================

// Compound index for efficient queries by user and service
HealthRecordSchema.index({ did: 1, pairwiseDID: 1 });

// Index for date-based queries
HealthRecordSchema.index({ date: -1 });

// Index for type-based filtering
HealthRecordSchema.index({ type: 1 });

// Compound index for hospital queries
HealthRecordSchema.index({ hospital: 1, date: -1 });

export const HealthRecordModel = mongoose.model<IHealthRecord>('HealthRecord', HealthRecordSchema);
