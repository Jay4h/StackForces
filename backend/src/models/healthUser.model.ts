import mongoose, { Schema, Document } from 'mongoose';

export interface IHealthUser extends Document {
    did: string;
    pairwiseDID: string;
    role: 'citizen' | 'doctor' | 'patient' | 'healthcare_provider' | 'policy_maker' | 'government' | 'admin';
    personalInfo: {
        name?: string;
        email?: string;
        phone?: string;
        specialization?: string; // For doctors
        organization?: string; // For healthcare providers, government
        department?: string;
    };
    permissions: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const HealthUserSchema = new Schema<IHealthUser>(
    {
        did: { type: String, required: true, index: true },
        pairwiseDID: { type: String, required: true, unique: true, index: true },
        role: {
            type: String,
            required: true,
            enum: ['citizen', 'doctor', 'patient', 'healthcare_provider', 'policy_maker', 'government', 'admin'],
            default: 'citizen'
        },
        personalInfo: {
            name: String,
            email: String,
            phone: String,
            specialization: String,
            organization: String,
            department: String
        },
        permissions: [{ type: String }],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Indexes
HealthUserSchema.index({ did: 1, pairwiseDID: 1 });
HealthUserSchema.index({ role: 1 });

export const HealthUserModel = mongoose.model<IHealthUser>('HealthUser', HealthUserSchema);
