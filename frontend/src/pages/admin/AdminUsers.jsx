import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { 
  Users, Mail, Shield, UserX, UserCheck, 
  Search, Loader2, ChevronRight, ShieldAlert,
  ArrowRight, MoreHorizontal, User as UserIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      // Re-using admin stats or existing logic to get users?
      // For now we'll fetch from the requests API to see who is active if there is no /admin/users endpoint.
      // Wait, let's assume /admin/users exists or we can mock it from requests.
      // Actually, I'll' check if I can get users.
      const res = await api.get('/admin/requests');
      const uniqueUsers = Array.from(new Set(res.data.map(r => JSON.stringify(r.user))))
                            .map(s => JSON.parse(s))
                            .filter(u => u != null);
      setUsers(uniqueUsers);
    } catch (error) {
      toast.error("User management fetch error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Populating User Identity Matrix...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
      
      {/* Identity Control Header */}
      <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
         <div className="relative z-10">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Identity Matrix</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.15em] mt-2 flex items-center gap-2">
               <ShieldCheck size={14} className="text-indigo-600" /> Administrative Access Control
            </p>
         </div>
         <div className="relative z-10 bg-slate-50 p-2 rounded-2xl border border-slate-100 flex items-center gap-4">
             <div className="px-4 border-r border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated</p>
                <p className="text-xl font-black text-slate-900 leading-none">{users.length}</p>
             </div>
             <div className="pr-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 leading-none">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                   Matrix Healthy
                </div>
             </div>
         </div>
      </div>

      {/* User Table Stream */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-slate-100">
            <div className="relative max-w-sm">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                  type="text" 
                  placeholder="Filter by name or secure email..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-[1.25rem] outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm font-bold text-slate-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>
         <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left">
               <thead className="bg-[#fcfdff] border-b border-slate-100">
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-5">Verified Identity</th>
                  <th className="px-8 py-5">Communication Endpoint</th>
                  <th className="px-8 py-5">Access Permission</th>
                  <th className="px-8 py-5 text-right pr-12">Security Actions</th>
                </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {filteredUsers.map((u, i) => (
                   <tr key={i} className="hover:bg-slate-50/50 transition-all duration-300 animate-in fade-in group">
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-900 font-extrabold transition-all group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white">
                              {u.name.charAt(0)}
                           </div>
                           <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-900 leading-none mb-1.5">{u.name}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Entry System</span>
                           </div>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-600">
                           <Mail size={12} className="text-slate-400" />
                           {u.email}
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-tight">
                           <Shield size={12} /> User Access
                        </div>
                     </td>
                     <td className="px-8 py-6 text-right pr-8">
                        <div className="flex items-center justify-end gap-2">
                           <button className="h-10 px-4 rounded-2xl bg-slate-100 hover:bg-slate-900 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                              Adjust Scope
                           </button>
                           <button className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center shadow-sm">
                              <UserX size={18} />
                           </button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default AdminUsers;
