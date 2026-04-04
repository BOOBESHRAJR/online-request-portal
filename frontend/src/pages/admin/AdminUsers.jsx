import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { 
  Users, Mail, Shield, UserX, UserCheck, 
  Search, Loader2, ShieldCheck,
  ShieldAlert, User as UserIcon, Trash2,
  RefreshCw, MoreVertical, Edit
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      toast.error("User management fetch error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("CRITICAL: Deleting this user will permanently remove their identity from the system. Proceed?")) return;
    
    try {
      setProcessing(userId);
      await api.delete(`/admin/users/${userId}`);
      toast.success("Identity purged successfully.");
      setUsers(users.filter(u => u._id !== userId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Purge operation failed.");
    } finally {
      setProcessing(null);
    }
  };

  const handleUpdateRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      setProcessing(userId);
      await api.put(`/admin/users/${userId}`, { role: newRole });
      toast.success(`Access level escalated to ${newRole.toUpperCase()}.`);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      toast.error("Role escalation protocol failed.");
    } finally {
      setProcessing(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
      <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Populating User Identity Matrix...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-16"
    >
      
      {/* Identity Control Header */}
      <div className="bg-[#0f172a] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-110"></div>
         
         <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="space-y-4">
               <h1 className="text-4xl font-black text-white tracking-tight leading-none">Identity Matrix</h1>
               <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.25em] mt-2 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-indigo-500 animate-pulse" /> 
                  Unified Access Control Ledger
               </p>
            </div>
            
            <div className="flex items-center gap-5 bg-white/5 p-3 rounded-3xl border border-white/10 backdrop-blur-xl shadow-inner">
               <div className="px-6 py-2 border-r border-white/10">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">Total Entities</p>
                  <p className="text-2xl font-black text-white leading-none tracking-tighter">{users.length}</p>
               </div>
               <button 
                  onClick={fetchUsers}
                  className="pr-6 pl-2 hover:text-indigo-400 transition-colors"
                  title="Synchronize Grid"
               >
                  <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
               </button>
            </div>
         </div>
      </div>

      {/* User Table Stream */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden group/container">
         <div className="p-8 border-b border-slate-100 bg-[#fcfdff]/50">
            <div className="relative max-w-xl group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
               <input 
                  type="text" 
                  placeholder="Query filtered identities by name or primary communication endpoint..."
                  className="w-full pl-16 pr-8 py-5 bg-white border-none rounded-2xl outline-none ring-1 ring-slate-200 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold text-slate-900 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>

         <div className="overflow-x-auto min-h-[500px]">
            <table className="w-full text-left border-collapse">
               <thead className="bg-[#fcfdff] border-b border-slate-100">
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">
                  <th className="px-10 py-6">Identity Key</th>
                  <th className="px-10 py-6">Communication Endpoint</th>
                  <th className="px-10 py-6">Access Protocol</th>
                  <th className="px-10 py-6 text-right pr-14">Administrative Logic</th>
                </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 text-slate-600">
                 <AnimatePresence mode='popLayout'>
                  {filteredUsers.map((u, i) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      key={u._id} 
                      className={`hover:bg-indigo-50/30 transition-all duration-300 group border-l-[6px] border-l-transparent hover:border-l-indigo-600 ${processing === u._id ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <td className="px-10 py-6 whitespace-nowrap">
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm shadow-sm group-hover:scale-110 transition-transform">
                               {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                               <span className="text-sm font-black text-slate-900 leading-none mb-2">{u.name}</span>
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u._id.slice(-10).toUpperCase()}</span>
                            </div>
                         </div>
                      </td>
                      <td className="px-10 py-6">
                         <div className="flex items-center gap-3 text-xs font-bold text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 inline-flex">
                            <Mail size={14} className="text-slate-400" />
                            {u.email}
                         </div>
                      </td>
                      <td className="px-10 py-6">
                         <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            u.role === 'admin' 
                            ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-sm shadow-rose-100' 
                            : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                         }`}>
                            {u.role === 'admin' ? <Shield size={14} /> : <UserIcon size={14} />}
                            {u.role} Access
                         </div>
                      </td>
                      <td className="px-10 py-6 text-right pr-10">
                         <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                               onClick={() => handleUpdateRole(u._id, u.role)}
                               className="h-10 px-4 flex items-center gap-2 rounded-xl bg-slate-900 text-white hover:bg-indigo-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg"
                               title="Modify Authorization"
                            >
                               {u.role === 'admin' ? 'Revoke Admin' : 'Elevate Access'}
                            </button>
                            <button 
                               onClick={() => handleDeleteUser(u._id)}
                               className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center border border-slate-200"
                               title="Purge Identity"
                            >
                               <Trash2 size={18} />
                            </button>
                         </div>
                      </td>
                    </motion.tr>
                  ))}
                 </AnimatePresence>
               </tbody>
            </table>
         </div>
      </div>
    </motion.div>
  );
};

export default AdminUsers;
