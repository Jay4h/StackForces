
import express from 'express';
import { authorize, previewShadowID, approveAuthorization, exchangeToken } from '../controllers/oauth.controller';

const router = express.Router();

// OAuth 2.0 Standard Endpoints
router.get('/authorize', authorize);
router.post('/token', exchangeToken);

// Proman Custom Endpoints for Frontend Consent UI
router.post('/preview', previewShadowID);
router.post('/approve', approveAuthorization);

export default router;
