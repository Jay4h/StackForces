import mongoose, { Schema, Document } from 'mongoose';

export interface IFamilyRelationship extends Document {
    requesterDID: string;
    targetDID: string;
    relationship: 'Parent' | 'Child' | 'Spouse' | 'Sibling' | 'Other';
    status: 'Pending' | 'Accepted' | 'Rejected';
    createdAt: Date;
    updatedAt: Date;
}

const FamilyRelationshipSchema = new Schema<IFamilyRelationship>(
    {
        requesterDID: { type: String, required: true, index: true },
        targetDID: { type: String, required: true, index: true },
        relationship: {
            type: String,
            enum: ['Parent', 'Child', 'Spouse', 'Sibling', 'Other'],
            required: true
        },
        status: {
            type: String,
            enum: ['Pending', 'Accepted', 'Rejected'],
            default: 'Pending'
        }
    },
    { timestamps: true }
);

// Ensure unique relationship between two DIDs (uni-directional or bi-directional handling needs care)
// For simplicity, we check if A invited B.
FamilyRelationshipSchema.index({ requesterDID: 1, targetDID: 1 }, { unique: true });

export const FamilyRelationshipModel = mongoose.model<IFamilyRelationship>('FamilyRelationship', FamilyRelationshipSchema);
