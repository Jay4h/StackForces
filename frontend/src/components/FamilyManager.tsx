import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, Check, X, Mail, Loader2 } from 'lucide-react';

export default function FamilyManager() {
    const { user } = useAuth();
    const [invites, setInvites] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [relationship, setRelationship] = useState('Parent');

    const API_BASE_URL = 'http://localhost:3000/api';

    useEffect(() => {
        if (user?.did) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        if (!user?.did) return;
        try {
            // Fetch Incoming Invites
            const resInvites = await fetch(`${API_BASE_URL}/family/requests/${user.did}`);
            const dataInvites = await resInvites.json();
            if (dataInvites.success) setInvites(dataInvites.invites);

            // Fetch Members
            const resMembers = await fetch(`${API_BASE_URL}/family/members/${user.did}`);
            const dataMembers = await resMembers.json();
            if (dataMembers.success) setMembers(dataMembers.members);
        } catch (error) {
            console.error('Failed to fetch family data');
        }
    };

    const sendInvite = async () => {
        if (!inviteEmail || !user?.did) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/family/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requesterDID: user.did,
                    targetEmail: inviteEmail,
                    relationship
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Invite sent successfully');
                setInviteEmail('');
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Failed to send invite');
        } finally {
            setLoading(false);
        }
    };

    const respondInfo = async (inviteId: string, status: 'Accepted' | 'Rejected') => {
        try {
            const res = await fetch(`${API_BASE_URL}/family/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inviteId, status })
            });
            const data = await res.json();
            if (data.success) {
                fetchData(); // Refresh list
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Action failed');
        }
    };

    return (
        <div className="space-y-6">
            {/* Invite Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-gray-600" /> Add Family Member
                </h3>
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="text-sm text-gray-500 mb-1 block">Member's Email</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                placeholder="email@example.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1d1d1f]/20"
                            />
                        </div>
                    </div>
                    <div className="w-1/3">
                        <label className="text-sm text-gray-500 mb-1 block">Relationship</label>
                        <select
                            value={relationship}
                            onChange={(e) => setRelationship(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1d1d1f]/20"
                        >
                            <option value="Parent">Parent</option>
                            <option value="Child">Child</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <button
                        onClick={sendInvite}
                        disabled={loading || !inviteEmail}
                        className="px-6 py-2 bg-[#1d1d1f] text-white rounded-xl font-medium hover:bg-[#2d2d2f] disabled:opacity-50 transition"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Invite'}
                    </button>
                </div>
            </div>

            {/* Pending Invites */}
            {invites.length > 0 && (
                <div className="bg-orange-50 rounded-2xl border border-orange-100 p-6">
                    <h3 className="text-lg font-semibold text-orange-800 mb-4">Pending Requests</h3>
                    <div className="space-y-3">
                        {invites.map((inv) => (
                            <div key={inv._id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-orange-100">
                                <div>
                                    <p className="font-medium text-gray-900">{inv.requesterName}</p>
                                    <p className="text-sm text-gray-500">wants to add you as <span className="font-medium text-gray-700">{inv.relationship}</span></p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => respondInfo(inv._id, 'Accepted')} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"><Check className="w-4 h-4" /></button>
                                    <button onClick={() => respondInfo(inv._id, 'Rejected')} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"><X className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* My Family List */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-600" /> My Family
                </h3>
                {members.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {members.map((member) => (
                            <div key={member.relationId} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                    {member.name[0]}
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                                    <p className="text-sm text-gray-500">{member.relationship}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        No family members added yet.
                    </div>
                )}
            </div>
        </div>
    );
}
