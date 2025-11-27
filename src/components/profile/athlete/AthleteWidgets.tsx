import React, { useState } from 'react';
import { useGroups } from '../../../hooks/useGroups';
import { usePersonalCoach } from '../../../hooks/usePersonalCoach';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-toastify';
import { Loader2, Users, LogOut, User } from 'lucide-react';

export const GroupWidget = () => {
    const { groups, isLoading } = useGroups();
    const userGroup = groups.length > 0 ? groups[0] : null;
    const [code, setCode] = useState('');
    const [isActing, setIsActing] = useState(false);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!code) return;
        setIsActing(true);
        const { data, error } = await supabase.rpc('join_group_with_code', { p_invitation_code: code });
        if (error) toast.error(error.message);
        else toast.success(data.message);
        setIsActing(false);
        setCode('');
    };

    const handleLeave = async () => {
        if(!userGroup) return;
        if(!window.confirm("Quitter ce groupe ?")) return;
        setIsActing(true);
        await supabase.rpc('leave_group', { p_group_id: userGroup.id });
        setIsActing(false);
    };

    if (isLoading) return <Loader2 className="animate-spin text-gray-500 mx-auto"/>;

    if (!userGroup) {
        return (
            <form onSubmit={handleJoin} className="flex gap-2 w-full">
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CODE GROUPE" className="bg-[#0a0b10] text-white text-sm rounded-lg px-3 py-2 w-full border border-gray-800 uppercase tracking-widest text-center" />
                <button disabled={isActing} className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition-colors">
                    {isActing ? <Loader2 size={16} className="animate-spin"/> : <Users size={16} />}
                </button>
            </form>
        );
    }

    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sprint-primary/20 flex items-center justify-center text-sprint-primary font-bold">
                    {userGroup.name.charAt(0)}
                </div>
                <div>
                    <h4 className="font-bold text-white leading-tight">{userGroup.name}</h4>
                    <p className="text-xs text-gray-500">{userGroup.member_count} membres</p>
                </div>
            </div>
            <button onClick={handleLeave} disabled={isActing} className="text-gray-600 hover:text-red-500 transition-colors">
                <LogOut size={18} />
            </button>
        </div>
    );
};

export const CoachWidget = () => {
    const { personalCoach, isLoading, joinCoach, leaveCoach } = usePersonalCoach();
    const [code, setCode] = useState('');
    const [isActing, setIsActing] = useState(false);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!code) return;
        setIsActing(true);
        const res = await joinCoach(code);
        if(res.success) toast.success(res.message);
        else toast.error(res.message);
        setIsActing(false);
        setCode('');
    };

    const handleLeave = async () => {
        if(!personalCoach) return;
        if(!window.confirm("Arrêter le suivi ?")) return;
        setIsActing(true);
        await leaveCoach(personalCoach.id);
        setIsActing(false);
    };

    if (isLoading) return <Loader2 className="animate-spin text-gray-500 mx-auto"/>;

    if (!personalCoach) {
        return (
            <form onSubmit={handleJoin} className="flex gap-2 w-full">
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CODE COACH" className="bg-[#0a0b10] text-white text-sm rounded-lg px-3 py-2 w-full border border-gray-800 uppercase tracking-widest text-center" />
                <button disabled={isActing} className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition-colors">
                    {isActing ? <Loader2 size={16} className="animate-spin"/> : <User size={16} />}
                </button>
            </form>
        );
    }

    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
                <img src={personalCoach.photo_url || ''} alt="Coach" className="w-10 h-10 rounded-full bg-gray-800 object-cover" />
                <div>
                    <h4 className="font-bold text-white leading-tight">{personalCoach.full_name}</h4>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Coach Personnel</span>
                </div>
            </div>
            <button onClick={handleLeave} disabled={isActing} className="text-gray-600 hover:text-red-500 transition-colors">
                <LogOut size={18} />
            </button>
        </div>
    );
};
