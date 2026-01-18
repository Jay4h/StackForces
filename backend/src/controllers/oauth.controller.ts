
import { Request, Response } from 'express';
import { generateShadowDID } from '../services/cpp-bridge';
import { UserModel } from '../models/user.model';
import { DIDModel } from '../models/did.model';
import jwt from 'jsonwebtoken';

// Mock Client Registry
const CLIENTS: Record<string, { secret: string, name: string, redirectUris: string[] }> = {
    'health_portal_client': {
        secret: 'health_secret',
        name: 'Health Portal Services',
        redirectUris: ['http://localhost:5173/health-callback']
    },
    'farm_portal_client': {
        secret: 'farm_secret',
        name: 'Kisan Farm Subsidy Portal',
        redirectUris: ['http://localhost:5173/farm-callback']
    }
};

// Mock Auth Codes (In production, use Redis)
const AUTH_CODES: Record<string, { did: string, clientId: string, scope: string, nonce?: string }> = {};

/**
 * Authorization Endpoint
 * GET /api/oauth/authorize
 * 
 * 1. Checks Client ID
 * 2. Checks User Session (via cookie or mocked header for this hackathon)
 * 3. Redirects to Frontend Consent Page
 */
export const authorize = async (req: Request, res: Response) => {
    const { client_id, redirect_uri, scope, state, response_type } = req.query;

    if (!client_id || !redirect_uri || !response_type) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const client = CLIENTS[client_id as string];
    if (!client) {
        return res.status(400).json({ error: 'Invalid client_id' });
    }

    // In a real OAuth flow, we would check session cookies here.
    // For this hackathon, we assume the Frontend handles the initial "Am I logged in?" check 
    // and sends the user to /oauth/consent if they are.
    // However, if this endpoint is hit directly, we should redirect to the frontend consent page.

    const consentUrl = `http://localhost:5173/oauth/consent?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}`;

    // Redirect user to the consent screen
    return res.redirect(consentUrl);
};

/**
 * Preview Shadow ID
 * POST /api/oauth/preview
 * Used by Consent Page to show the user "This is the ID we will send"
 */
export const previewShadowID = async (req: Request, res: Response) => {
    const { client_id, user_did } = req.body;

    if (!client_id || !user_did) {
        return res.status(400).json({ success: false, message: 'Missing client_id or user_did' });
    }

    // Verify User exists (Check DID Registry)
    console.log(`[OAuth] Preview request for DID: ${user_did}`);
    const user = await DIDModel.findOne({ did: user_did });

    if (!user) {
        console.log(`[OAuth] User NOT FOUND for DID: ${user_did}`);
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate Shadow DID
    // Formula: SHA256(MasterDID + ServiceID)
    const shadowDID = generateShadowDID(user_did, client_id);

    const client = CLIENTS[client_id];

    return res.json({
        success: true,
        serviceName: client ? client.name : 'Unknown Service',
        shadowDID
    });
};

/**
 * Issue Authorization Code
 * POST /api/oauth/approve
 * Called when user clicks "Confirm" on Consent Page
 */
export const approveAuthorization = async (req: Request, res: Response) => {
    const { client_id, user_did, scope, redirect_uri, state } = req.body;

    // Generate short-lived auth code
    const authCode = 'code_' + Math.random().toString(36).substring(7);

    AUTH_CODES[authCode] = {
        did: user_did,
        clientId: client_id,
        scope: scope,
    };

    // Return the callback URL
    const callbackUrl = `${redirect_uri}?code=${authCode}&state=${state}`;
    return res.json({ success: true, callbackUrl });
};

/**
 * Token Exchange
 * POST /api/oauth/token
 */
export const exchangeToken = async (req: Request, res: Response) => {
    const { code, client_id, client_secret } = req.body;

    const authData = AUTH_CODES[code];

    // Validate Code
    if (!authData) {
        return res.status(400).json({ error: 'Invalid or expired Authorization Code' });
    }

    // Validate Client Secret
    const client = CLIENTS[client_id];
    if (!client || client.secret !== client_secret) {
        return res.status(401).json({ error: 'Invalid Client Credentials' });
    }

    // Generate Shadow DID
    const shadowDID = generateShadowDID(authData.did, client_id);

    // Create JWT
    // The "sub" is the SHADOW DID, not the REAL DID.
    const token = jwt.sign(
        {
            sub: shadowDID,
            aud: client_id,
            scope: authData.scope,
            iss: 'https://praman.india.gov.in' // Mock Issuer
        },
        'OAUTH_SECRET_KEY_FOR_HACKATHON',
        { expiresIn: '1h' }
    );

    // Cleanup code
    delete AUTH_CODES[code];

    res.json({
        access_token: token,
        token_type: 'Bearer',
        expires_in: 3600,
        sub: shadowDID // Explicitly return shadow DID for visibility
    });
};
