// Load environment variables before anything else
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.join(__dirname, '../../.env');
console.log('🔍 Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('❌ Failed to load .env:', result.error.message);
} else {
    console.log('✅ .env loaded successfully');
    console.log('📋 MONGODB_URI:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 40) + '...' : 'NOT FOUND');
}

export const envLoaded = true;
