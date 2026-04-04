import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { 
  Database, ShieldCheck, Mail, Users, 
  Loader2, Settings, RefreshCw, Trash2, 
  Activity, Server, Lock, HelpCircle,
  FileText, ShieldAlert, CheckCircle2,
  Cpu, HardDrive, Network
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSystem = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (error) {
        toast.error("System fetch error.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
       toast.success("System data refreshed.");
       setLoading(false);
    }, 800);
  };

  const clearLogs = () => {
    toast.success("Audit logs cleared (Simulation).");
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Pinging System Hardware Access...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-top-6 duration-700 pb-10">
      
      {/* System Oversight Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-4">
         <div className="space-y-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">System Health & Control</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.12em] flex items-center gap-2 leading-none">
               <Server size={14} className="text-blue-600" /> Integrated Hardware Monitoring Oversight
            </p>
         </div>
         <div className="flex items-center gap-3">
            <button 
               onClick={refreshData}
               className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-[1.25rem] text-xs font-black uppercase tracking-widest text-slate-900 shadow-sm hover:shadow-md transition-all active:scale-95"
            >
               <RefreshCw size={14} className="text-blue-600" /> Refresh Intelligence
            </button>
            <button 
               onClick={clearLogs}
               className="flex items-center gap-3 px-6 py-3 bg-rose-600 hover:bg-rose-700 rounded-[1.25rem] text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-rose-600/20 active:scale-95 transition-all"
            >
               <Trash2 size={14} /> Clear Audit Integrity
            </button>
         </div>
      </div>

      {/* Control Grid Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Live Performance Panel */}
         <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: 'System Queue Volume', value: stats.total, icon: Database, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
                  { label: 'Active User Matrix', value: 'Live Access', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50/50' },
                  { label: 'Audit Compliance', value: '99.8%', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                  { label: 'Network Integrity', value: 'Healthy', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50/50' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col gap-8 transition-transform hover:scale-[1.02] duration-300 group">
                    <div className="flex items-center justify-between">
                       <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-500`}>
                          <stat.icon size={26} />
                       </div>
                       <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Stable Trace</span>
                       </div>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                       <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Hardware Status Simulation */}
            <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
               <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-10 mb-12">
                  <div className="space-y-2">
                     <h3 className="text-2xl font-black text-white tracking-tight">Access Control & Latency</h3>
                     <p className="text-slate-400 text-sm font-medium">Real-time system hardware throughput and response vector analysis.</p>
                  </div>
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-indigo-400 uppercase tracking-widest backdrop-blur-md">
                     <Lock size={14} /> End-to-End Encryption Mode
                  </div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  {[
                     { label: 'Compute Unit', value: '14%', icon: Cpu },
                     { label: 'Storage Density', value: '2.4 GB', icon: HardDrive },
                     { label: 'Request Vector', value: '62ms', icon: Network }
                  ].map((stat, i) => (
                     <div key={i} className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-slate-500 mb-2">
                           <stat.icon size={18} />
                           <p className="text-[10px] font-black uppercase tracking-widest leading-none">{stat.label}</p>
                        </div>
                        <div className="bg-white/5 h-2 w-full rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 rounded-full" style={{ width: stat.value }}></div>
                        </div>
                        <p className="text-xl font-black text-white leading-none">{stat.value}</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Right Control Sidebar */}
         <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col gap-6">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-slate-900 pl-4 py-1 leading-none">Security Protocol</h3>
               <div className="space-y-4">
                  {[
                    { label: '2FA Integrity', status: 'Global', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'System Lock', status: 'Inactive', icon: Lock, color: 'text-slate-400', bg: 'bg-slate-50' },
                    { label: 'IP Oversight', status: 'Active', icon: ShieldAlert, color: 'text-blue-600', bg: 'bg-blue-50' }
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group cursor-pointer hover:bg-white hover:shadow-md transition-all">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl ${p.bg} ${p.color} flex items-center justify-center border border-white`}>
                             <p.icon size={18} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">{p.label}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">{p.status}</p>
                          </div>
                       </div>
                       <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                    </div>
                  ))}
               </div>
               <button className="w-full py-4 mt-2 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:bg-blue-600 active:scale-[0.98]">
                  Run Security Audit
               </button>
            </div>

            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group border border-white/10">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
               <div className="relative z-10 flex flex-col items-center text-center gap-6">
                  <div className="w-16 h-16 bg-white shadow-xl rounded-[1.5rem] flex items-center justify-center text-indigo-600 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                     <HelpCircle size={32} />
                  </div>
                  <div className="space-y-3">
                     <h4 className="text-lg font-black tracking-tight leading-loose">Need System Support?</h4>
                     <p className="text-indigo-100 text-[11px] font-bold uppercase tracking-widest leading-relaxed">Dedicated administrative helpdesk accessible globally.</p>
                  </div>
                  <button className="w-full py-3 bg-white/15 hover:bg-white/25 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                     View Protocols
                  </button>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default AdminSystem;
