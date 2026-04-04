import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { 
  Database, ShieldCheck, Mail, Users, 
  Loader2, Settings, RefreshCw, Trash2, 
  Activity, Server, Lock, HelpCircle,
  FileText, ShieldAlert, CheckCircle2,
  Cpu, HardDrive, Network, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSystem = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (error) {
      toast.error("System intelligence sync error.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const clearLogs = () => {
    toast.success("Audit logs purged (Simulation).");
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
      <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Pinging System Hardware Access...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10 animate-in slide-in-from-top-6 duration-700 pb-16"
    >
      
      {/* System Oversight Header */}
      <div className="bg-[#0f172a] rounded-[3rem] p-12 overflow-hidden shadow-2xl border border-white/5 relative group">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -mr-64 -mt-64 transition-transform duration-1000 group-hover:scale-110"></div>
         
         <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="space-y-4">
               <h1 className="text-5xl font-black text-white tracking-tight leading-none">System Oversight</h1>
               <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.15em] flex items-center gap-3">
                  <Server size={18} className="text-blue-500 animate-pulse" /> 
                  Unified Cluster Monitoring Terminal
               </p>
            </div>
            
            <div className="flex items-center gap-4">
               <button 
                  onClick={handleRefresh}
                  className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-xl backdrop-blur-xl hover:bg-white/10 transition-all active:scale-95"
               >
                  <RefreshCw size={16} className={`text-blue-400 ${refreshing ? 'animate-spin' : ''}`} /> Sync Intelligence
               </button>
               <button 
                  onClick={clearLogs}
                  className="flex items-center gap-3 px-8 py-4 bg-rose-600/10 border border-rose-500/20 rounded-2xl text-xs font-black uppercase tracking-widest text-rose-500 shadow-xl hover:bg-rose-600 hover:text-white transition-all active:scale-95"
               >
                  <Trash2 size={16} /> Data Purge
               </button>
            </div>
         </div>
      </div>

      {/* Control Grid Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* Live Performance Panel */}
         <div className="lg:col-span-2 space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { label: 'Intelligence Repository', value: stats?.total || 0, sub: 'Units', icon: Database, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                  { label: 'Active Identity Matrix', value: stats?.userCount || 0, sub: 'Entities', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { label: 'Audit Integrity', value: '99.9%', sub: 'Healthy', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Signal Stability', value: 'Healthy', sub: 'Stable', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' }
                ].map((stat, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col gap-10 hover:shadow-xl transition-all group"
                  >
                    <div className="flex items-center justify-between">
                       <div className={`p-5 rounded-3xl ${stat.bg} ${stat.color} shadow-sm border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                          <stat.icon size={32} />
                       </div>
                       <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Stream</span>
                       </div>
                    </div>
                    <div>
                       <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3">{stat.label}</p>
                       <div className="flex items-baseline gap-2">
                          <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{stat.sub}</p>
                       </div>
                    </div>
                  </motion.div>
                ))}
            </div>

            {/* Hardware Status Simulation */}
            <div className="bg-[#0a0f1e] p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group border border-white/5">
               <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform duration-1000 group-hover:scale-125"></div>
               <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-12 mb-16">
                  <div className="space-y-3">
                     <h3 className="text-3xl font-black text-white tracking-tight">Signal Analysis</h3>
                     <p className="text-slate-500 text-base font-medium max-w-sm">Deep-layer hardware throughput and response vector analysis across assigned clusters.</p>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black text-indigo-400 uppercase tracking-widest backdrop-blur-3xl shadow-inner">
                     <Lock size={16} /> Secure Protocol Active
                  </div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
                  {[
                     { label: 'Compute Unit', value: '18%', icon: Cpu, color: 'bg-indigo-500' },
                     { label: 'Storage Density', value: '3.1 GB', icon: HardDrive, color: 'bg-blue-500' },
                     { label: 'Latency Vector', value: '48ms', icon: Network, color: 'bg-emerald-500' }
                  ].map((stat, i) => (
                     <div key={i} className="flex flex-col gap-5">
                        <div className="flex items-center gap-4 text-slate-500">
                           <stat.icon size={20} className="text-slate-400" />
                           <p className="text-[11px] font-black uppercase tracking-[0.2em] leading-none mb-0.5">{stat.label}</p>
                        </div>
                        <div className="bg-white/5 h-3 w-full rounded-full overflow-hidden shadow-inner ring-1 ring-white/5">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: stat.value === '48ms' ? '48%' : stat.value }}
                              transition={{ duration: 1.5, ease: "circOut" }}
                              className={`h-full ${stat.color} rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
                           ></motion.div>
                        </div>
                        <p className="text-2xl font-black text-white leading-none tracking-tight">{stat.value}</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Right Control Sidebar */}
         <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col gap-8">
               <div className="flex items-center gap-5 border-l-4 border-slate-900 pl-6 py-2">
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-widest leading-none">Security Stack</h3>
               </div>
               <div className="space-y-5">
                  {[
                    { label: 'Identity Filter', status: 'Active', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Cluster Lock', status: 'Global', icon: Lock, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { label: 'Threat Radar', status: 'Passive', icon: ShieldAlert, color: 'text-blue-500', bg: 'bg-blue-50' }
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-3xl border border-slate-100 group cursor-pointer hover:bg-white hover:shadow-lg hover:scale-[1.02] transition-all">
                       <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl ${p.bg} ${p.color} flex items-center justify-center border border-white shadow-sm group-hover:scale-110 transition-transform`}>
                             <p.icon size={22} />
                          </div>
                          <div>
                             <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1.5">{p.label}</p>
                             <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'Active' || p.status === 'Global' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none">{p.status}</p>
                             </div>
                          </div>
                       </div>
                       <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-900 transition-all group-hover:translate-x-1" />
                    </div>
                  ))}
               </div>
               <button className="w-full py-5 mt-4 bg-slate-900 text-white rounded-[1.75rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-600 active:scale-[0.98] transition-all">
                  Run Grid Verification
               </button>
            </div>

            <div className="bg-indigo-600 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group border border-white/10">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 transition-transform duration-1000 group-hover:scale-150"></div>
               <div className="relative z-10 flex flex-col items-center text-center gap-8">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-3xl shadow-2xl rounded-[2rem] flex items-center justify-center text-white rotate-12 group-hover:rotate-0 transition-transform duration-700 border border-white/20">
                     <HelpCircle size={40} />
                  </div>
                  <div className="space-y-4">
                     <h4 className="text-2xl font-black tracking-tight leading-tight">Support Node</h4>
                     <p className="text-indigo-100 text-xs font-bold uppercase tracking-[0.15em] leading-relaxed">Dedicated administrative helpdesk accessible 24/7 globally.</p>
                  </div>
                  <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-indigo-50 transition-all px-8">
                     Access Knowledge Base
                  </button>
               </div>
            </div>
         </div>

      </div>
    </motion.div>
  );
};

export default AdminSystem;
