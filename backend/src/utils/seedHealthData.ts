import { HealthRecordModel } from '../models/healthRecord.model';
import { HealthUserModel } from '../models/healthUser.model';

/**
 * Seed sample health data for testing
 * This creates realistic health records linked to a user's DID
 */
export async function seedHealthData(did: string, pairwiseDID: string, role: string) {
    try {
        // Check if data already exists
        const existingRecords = await HealthRecordModel.findOne({ did });
        if (existingRecords) {
            console.log('Health data already seeded for this user');
            return;
        }

        // Sample data based on role
        const sampleRecords = role === 'doctor' || role === 'healthcare_provider'
            ? getDoctorSampleData(did, pairwiseDID)
            : getPatientSampleData(did, pairwiseDID);

        // Insert records
        await HealthRecordModel.insertMany(sampleRecords);
        console.log(`✅ Seeded ${sampleRecords.length} health records for ${role}`);
    } catch (error) {
        console.error('Failed to seed health data:', error);
    }
}

function getPatientSampleData(did: string, pairwiseDID: string) {
    const today = new Date();
    const getDateOffset = (days: number) => {
        const date = new Date(today);
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
    };

    return [
        {
            did,
            pairwiseDID,
            type: 'Blood Test',
            title: 'Complete Blood Count (CBC)',
            doctor: 'Dr. Rajesh Kumar',
            hospital: 'AIIMS Delhi',
            date: getDateOffset(7),
            description: 'Routine blood work - All parameters normal',
            data: {
                hemoglobin: '14.5 g/dL',
                wbc: '7200 /μL',
                platelets: '250000 /μL',
                bloodGroup: 'O+',
                status: 'Normal'
            },
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
            did,
            pairwiseDID,
            type: 'Prescription',
            title: 'Hypertension Management',
            doctor: 'Dr. Priya Sharma',
            hospital: 'Apollo Hospital',
            date: getDateOffset(15),
            description: 'Blood pressure medication',
            data: {
                medicines: ['Amlodipine 5mg', 'Losartan 50mg'],
                dosage: 'Once daily',
                duration: '30 days',
                bp: '140/90 mmHg'
            },
            timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        },
        {
            did,
            pairwiseDID,
            type: 'X-Ray',
            title: 'Chest X-Ray',
            doctor: 'Dr. Amit Verma',
            hospital: 'Fortis Hospital',
            date: getDateOffset(30),
            description: 'Routine chest examination - Clear lungs',
            data: {
                findings: 'No abnormalities detected',
                impression: 'Normal chest radiograph',
                technique: 'PA view'
            },
            timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
            did,
            pairwiseDID,
            type: 'Vaccination',
            title: 'COVID-19 Booster Dose',
            doctor: 'Dr. Sunita Patel',
            hospital: 'Government Health Center',
            date: getDateOffset(45),
            description: 'Covaxin booster administered',
            data: {
                vaccine: 'Covaxin',
                batchNumber: 'COV2024-123',
                dose: 'Booster (3rd dose)',
                nextDue: 'N/A'
            },
            timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
        },
        {
            did,
            pairwiseDID,
            type: 'Consultation',
            title: 'General Health Checkup',
            doctor: 'Dr. Neha Gupta',
            hospital: 'Max Healthcare',
            date: getDateOffset(60),
            description: 'Annual health screening',
            data: {
                height: '170 cm',
                weight: '70 kg',
                bmi: '24.2',
                vitals: 'Normal',
                recommendations: 'Regular exercise, balanced diet'
            },
            timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
        }
    ];
}

function getDoctorSampleData(did: string, pairwiseDID: string) {
    const today = new Date();
    const getDateOffset = (days: number) => {
        const date = new Date(today);
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
    };

    return [
        {
            did: 'did:praman:patient001',
            pairwiseDID: 'did:praman:health:patient001pw',
            type: 'Blood Test',
            title: 'Diabetes Screening',
            doctor: 'Dr. Current User',
            hospital: 'City Hospital',
            date: getDateOffset(2),
            description: 'HbA1c test for diabetes monitoring',
            data: {
                hba1c: '6.5%',
                fastingGlucose: '110 mg/dL',
                status: 'Pre-diabetic',
                recommendation: 'Lifestyle modification advised'
            },
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
            did: 'did:praman:patient002',
            pairwiseDID: 'did:praman:health:patient002pw',
            type: 'Prescription',
            title: 'Asthma Management',
            doctor: 'Dr. Current User',
            hospital: 'City Hospital',
            date: getDateOffset(5),
            description: 'Inhaler prescription for asthma control',
            data: {
                medicines: ['Salbutamol Inhaler', 'Budesonide'],
                dosage: '2 puffs twice daily',
                duration: '60 days',
                severity: 'Mild persistent'
            },
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
            did: 'did:praman:patient003',
            pairwiseDID: 'did:praman:health:patient003pw',
            type: 'Surgery',
            title: 'Appendectomy',
            doctor: 'Dr. Current User',
            hospital: 'City Hospital',
            date: getDateOffset(10),
            description: 'Emergency appendix removal',
            data: {
                procedure: 'Laparoscopic appendectomy',
                duration: '45 minutes',
                outcome: 'Successful',
                recovery: 'Normal post-operative course'
            },
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        {
            did: 'did:praman:patient004',
            pairwiseDID: 'did:praman:health:patient004pw',
            type: 'Lab Report',
            title: 'Lipid Profile',
            doctor: 'Dr. Current User',
            hospital: 'City Hospital',
            date: getDateOffset(12),
            description: 'Cholesterol screening',
            data: {
                totalCholesterol: '220 mg/dL',
                ldl: '140 mg/dL',
                hdl: '45 mg/dL',
                triglycerides: '180 mg/dL',
                status: 'Borderline high'
            },
            timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
        },
        {
            did: 'did:praman:patient005',
            pairwiseDID: 'did:praman:health:patient005pw',
            type: 'Consultation',
            title: 'Hypertension Follow-up',
            doctor: 'Dr. Current User',
            hospital: 'City Hospital',
            date: getDateOffset(15),
            description: 'Blood pressure monitoring visit',
            data: {
                bp: '138/88 mmHg',
                pulse: '72 bpm',
                medications: 'Compliant',
                nextVisit: getDateOffset(-15)
            },
            timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        }
    ];
}

/**
 * Get health statistics from database
 */
export async function getHealthStats(did: string) {
    try {
        const totalRecords = await HealthRecordModel.countDocuments({ did });

        const recordsByType = await HealthRecordModel.aggregate([
            { $match: { did } },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        const latestRecord = await HealthRecordModel.findOne({ did })
            .sort({ timestamp: -1 })
            .select('date type title');

        return {
            totalRecords,
            recordsByType,
            latestRecord
        };
    } catch (error) {
        console.error('Failed to get health stats:', error);
        return null;
    }
}

export default {
    seedHealthData,
    getHealthStats
};
