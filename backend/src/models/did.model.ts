import mongoose, { Schema, Document } from 'mongoose';

export interface IDID extends Document {
    did: string;
    publicKey: string;
    deviceInfo: {
        hardwareId: string;
        userAgent: string;
        platform: string;
        deviceType?: 'Mobile' | 'PC' | 'Unknown';
        deviceName?: string;
        authenticatorType?: 'platform' | 'cross-platform';
    };
    credentialId: string;
    counter: number;
    profile?: {
        bloodGroup?: string;
        farmerStatus?: string;
        residencyStatus?: string;
        fullName?: string;
        dateOfBirth?: string;
        address?: string;
        phone?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const DIDSchema = new Schema<IDID>(
    {
        did: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        publicKey: {
            type: String,
            required: true
        },
        deviceInfo: {
            hardwareId: {
                type: String,
                required: true
            },
            userAgent: {
                type: String,
                required: true
            },
            platform: {
                type: String,
                required: true
            },
            deviceType: {
                type: String,
                enum: ['Mobile', 'PC', 'Unknown'],
                required: false
            },
            deviceName: {
                type: String,
                required: false
            },
            authenticatorType: {
                type: String,
                enum: ['platform', 'cross-platform'],
                required: false
            }
        },
        credentialId: {
            type: String,
            required: true,
            unique: true
        },
        counter: {
            type: Number,
            required: true,
            default: 0
        },
        profile: {
            type: {
                bloodGroup: String,
                farmerStatus: String,
                residencyStatus: String,
                fullName: String,
                dateOfBirth: String,
                address: String,
                phone: String
            },
            required: false,
            default: {}
        }
    },
    {
        timestamps: true
    }
);

export const DIDModel = mongoose.model<IDID>('DID', DIDSchema);
