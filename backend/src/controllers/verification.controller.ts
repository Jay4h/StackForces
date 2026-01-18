import { Request, Response } from 'express';
import { AccessLogModel } from '../models/accessLog.model';
import { verifyZKP } from '../services/cpp-bridge';

/**
 * Handle Age Verification via ZKP
 */
export const verifyAge = async (req: Request, res: Response) => {
    try {
        const { did, proof } = req.body;

        if (!did || !proof) {
            return res.status(400).json({ error: "Missing DID or Proof" });
        }

        // Call the C++ Bridge (simulated)
        const isValid = verifyZKP(proof, JSON.stringify({ minAge: 18 }));

        if (isValid) {
            // Log the successful verification
            await AccessLogModel.create({
                did,
                service: "Verifier Module",
                action: "ZKP Age Verification (>18)",
                status: "Approved",
                timestamp: new Date()
            });

            return res.status(200).json({
                success: true,
                message: "Proof Verified: User is > 18",
                verified: true
            });
        } else {
            // Log the failed verification
            await AccessLogModel.create({
                did,
                service: "Verifier Module",
                action: "ZKP Age Verification (>18)",
                status: "Denied",
                timestamp: new Date()
            });

            return res.status(400).json({
                success: false,
                message: "Proof Invalid"
            });
        }
    } catch (error) {
        console.error("ZKP Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * Get Consent History for a DID
 */
export const getConsentHistory = async (req: Request, res: Response) => {
    try {
        const { did } = req.params;

        const logs = await AccessLogModel.find({ did })
            .sort({ timestamp: -1 })
            .limit(20);

        return res.status(200).json({ success: true, logs });
    } catch (error) {
        console.error("History Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
