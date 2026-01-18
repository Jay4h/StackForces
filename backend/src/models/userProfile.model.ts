import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
    did: string; // Linked to DID
    personalInfo: {
        firstName: string;
        lastName: string;
        dateOfBirth?: Date;
        gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
        bloodGroup?: string;
        email: string;
        phone?: string;
        photoUrl?: string;
    };
    address: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    governmentIds: {
        aadhar?: string;
        pan?: string;
        passport?: string;
        drivingLicense?: string;
    };
    emergencyContact?: {
        name?: string;
        relationship?: string;
        phone?: string;
    };
    preferences: {
        language?: string;
        notifications?: boolean;
        dataSharing?: boolean;
    };
    isProfileComplete: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
    {
        did: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        personalInfo: {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            dateOfBirth: { type: Date },
            gender: {
                type: String,
                enum: ['Male', 'Female', 'Other', 'Prefer not to say']
            },
            bloodGroup: { type: String },
            email: { type: String, required: true, index: true },
            phone: { type: String },
            photoUrl: { type: String }
        },
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            postalCode: { type: String },
            country: { type: String, default: 'India' }
        },
        governmentIds: {
            aadhar: { type: String },
            pan: { type: String },
            passport: { type: String },
            drivingLicense: { type: String }
        },
        emergencyContact: {
            name: { type: String },
            relationship: { type: String },
            phone: { type: String }
        },
        preferences: {
            language: { type: String, default: 'English' },
            notifications: { type: Boolean, default: true },
            dataSharing: { type: Boolean, default: false }
        },
        isProfileComplete: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Indexes
UserProfileSchema.index({ 'personalInfo.email': 1 });
UserProfileSchema.index({ 'personalInfo.phone': 1 });
UserProfileSchema.index({ 'governmentIds.aadhar': 1 });

export const UserProfileModel = mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
