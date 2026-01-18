import { Request, Response } from 'express';
import { FamilyRelationshipModel } from '../models/familyRelationship.model';
import { UserProfileModel } from '../models/userProfile.model';

export const sendFamilyInvite = async (req: Request, res: Response) => {
    try {
        const { requesterDID, targetEmail, relationship } = req.body;

        if (!requesterDID || !targetEmail || !relationship) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Find target user by email
        const targetUser = await UserProfileModel.findOne({ 'personalInfo.email': targetEmail });
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User with this email not found' });
        }

        if (targetUser.did === requesterDID) {
            return res.status(400).json({ success: false, message: 'Cannot invite yourself' });
        }

        // Check if relationship already exists
        const existing = await FamilyRelationshipModel.findOne({
            $or: [
                { requesterDID, targetDID: targetUser.did },
                { requesterDID: targetUser.did, targetDID: requesterDID }
            ]
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'Relationship already exists or is pending' });
        }

        const invite = new FamilyRelationshipModel({
            requesterDID,
            targetDID: targetUser.did,
            relationship,
            status: 'Pending'
        });

        await invite.save();
        res.status(201).json({ success: true, message: 'Invite sent successfully', invite });

    } catch (error) {
        console.error('Send invite error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getIncomingInvites = async (req: Request, res: Response) => {
    try {
        const { did } = req.params;
        const invites = await FamilyRelationshipModel.find({ targetDID: did, status: 'Pending' });

        // Enrich with requester details
        const enrichedInvites = await Promise.all(invites.map(async (inv) => {
            const requester = await UserProfileModel.findOne({ did: inv.requesterDID });
            return {
                ...inv.toObject(),
                requesterName: requester ? `${requester.personalInfo.firstName} ${requester.personalInfo.lastName}` : 'Unknown'
            };
        }));

        res.json({ success: true, invites: enrichedInvites });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const respondToInvite = async (req: Request, res: Response) => {
    try {
        const { inviteId, status } = req.body; // status: 'Accepted' | 'Rejected'

        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const invite = await FamilyRelationshipModel.findByIdAndUpdate(
            inviteId,
            { status },
            { new: true }
        );

        if (!invite) {
            return res.status(404).json({ success: false, message: 'Invite not found' });
        }

        // If accepted, maybe create the reverse relationship for bi-directional access?
        // For now, we just mark this one as accepted. 
        // Logic: A is parent of B. If Accepted, A can manage B? Or just linked?
        // For simplicity: Linked.

        res.json({ success: true, message: `Invite ${status}`, invite });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getFamilyMembers = async (req: Request, res: Response) => {
    try {
        const { did } = req.params;
        // Find accepted relationships where user is requester OR target
        const relations = await FamilyRelationshipModel.find({
            $or: [{ requesterDID: did }, { targetDID: did }],
            status: 'Accepted'
        });

        const members = await Promise.all(relations.map(async (rel) => {
            const isRequester = rel.requesterDID === did;
            const otherDID = isRequester ? rel.targetDID : rel.requesterDID;
            const otherUser = await UserProfileModel.findOne({ did: otherDID });

            return {
                did: otherDID,
                name: otherUser ? `${otherUser.personalInfo.firstName} ${otherUser.personalInfo.lastName}` : 'Unknown',
                relationship: isRequester ? rel.relationship : `(Linked by ${rel.relationship})`, // Simplified logic
                relationId: rel._id
            };
        }));

        res.json({ success: true, members });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
