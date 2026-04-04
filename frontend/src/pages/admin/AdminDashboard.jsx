import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircle2, Clock, XCircle, Inbox, 
  Search, Mail, ChevronRight, List, 
  Loader2, Filter, User, ShieldCheck,
  Plus, Trash2, Edit, Layers, BarChart as BarIcon, 
  PieChart as PieIcon, Eye, ShieldAlert,
  ArrowUpRight, ArrowDownRight, Activity,
  AreaChart as AreaIcon, Target
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  AreaChart, Area
} from 'recharts';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
     total: 0, 
     pending: 0, 
     approved: 0, 
     rejected: 0,
     categoryCounts: [],
     timelineTrend: []
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [statsRes, reqRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/requests')
      ]);
      setStats(statsRes.data);
      setRequests(reqRes.data.slice(0, 5)); // Just recent items
    } catch (error) {
      toast.error("Oversight data sync interrupted.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 10000); // 10 sec live refresh
    return () => clearInterval(interval);
  }, []);

  const barData = [
    { name: 'Pending', count: stats.pending, fill: '#f59e0b' },
    { name: 'Approved', count: stats.approved, fill: '#10b981' },
    { name: 'Rejected', count: stats.rejected, fill: '#ef4444' }
  ];

  const pieData = stats.categoryCounts?.map(c => ({ name: c._id, value: c.count })) || [];
  const trendData = stats.timelineTrend || [];
  const COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
      <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Synchronizing System Intel...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6 }}
      className="space-y-10 animate-in fade-in duration-500 pb-16"
    >
      
      {/* SaaS Header Profile */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
         <div className="space-y-3">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">Central Oversight</h1>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.25em] flex items-center gap-2 leading-none">
               <ShieldAlert size={16} className="text-indigo-600 animate-pulse" /> 
               Unified System Control Terminal & Intelligence Grid
            </p>
         </div>
         <div className="flex items-center gap-5 bg-white p-3 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-default group">
             <div className="w-14 h-14 rounded-2xl bg-slate-900 p-0.5 flex items-center justify-center text-white font-black shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent"></div>
                {user?.name?.charAt(0).toUpperCase()}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[3px] border-white rounded-full"></div>
             </div>
             <div className="pr-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Active Controller</p>
                <div className="flex items-center gap-2 text-base font-black text-slate-900 leading-none">
                   {user?.name}
                </div>
             </div>
         </div>
      </div>

      {/* Row 1: Metrics with staggered entrance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'System Stream', value: stats.total, sub: 'Global Units', icon: Inbox, color: 'text-indigo-600', bg: 'bg-indigo-50/70', up: true },
          { label: 'Pending Review', value: stats.pending, sub: 'Active Queue', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/70', up: true },
          { label: 'System Authorized', value: stats.approved, sub: 'Audit Ready', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/70', up: true },
          { label: 'Rejected Protocol', value: stats.rejected, sub: 'Access Denied', icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50/70', up: false }
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            key={i} 
            className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden relative"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-bl-full opacity-30 -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000`}></div>
            <div className="flex items-start justify-between relative z-10 mb-8">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-sm border border-slate-100/50 group-hover:scale-110 transition-transform`}>
                <stat.icon size={26} />
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <div className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`}></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.sub}</span>
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-3">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                 <p className="text-4xl font-black text-slate-900 leading-none tracking-tighter">{stat.value}</p>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Total</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Row 2: 7-Day Trend (New Core Dashboard Chart) */}
      <motion.div 
         initial={{ opacity: 0, x: -20 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ delay: 0.4 }}
         className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm relative group hover:shadow-2xl transition-all"
      >
         <div className="flex items-center justify-between mb-12">
            <div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">System Momentum</h3>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-0.5">7-day chronological request vector</p>
            </div>
            <div className="flex gap-2">
               <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl shadow-sm border border-indigo-100 group-hover:rotate-12 transition-transform">
                  <TrendingUp size={24} />
               </div>
            </div>
         </div>
         <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                     <linearGradient id="dashboardTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                     dataKey="date" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fill: '#334155', fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }} 
                     height={40}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                  <Tooltip 
                     contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 30px 40px -15px rgb(0 0 0 / 0.15)', padding: '20px' }}
                     itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}
                  />
                  <Area 
                     type="step" 
                     dataKey="requests" 
                     stroke="#6366f1" 
                     strokeWidth={4} 
                     fillOpacity={1} 
                     fill="url(#dashboardTrend)" 
                     animationDuration={2000}
                  />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </motion.div>

      {/* Row 3: Enhanced Sub-Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Status Breakdown Bar */}
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all min-h-[480px] flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
               <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Request Status</h3>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-0.5">Live Processing throughput Matrix</p>
            </div>
            <div className="p-4 bg-slate-50 text-slate-400 rounded-3xl group-hover:bg-amber-50 group-hover:text-amber-600 transition-all border border-slate-100">
               <BarIcon size={22} />
            </div>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                   dataKey="name" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }} 
                   height={40}
                />
                <YAxis hide hide domain={[0, 'dataMax + 5']} />
                <Tooltip 
                   cursor={{ fill: '#f8fafc', radius: 15 }}
                   contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 30px -10px rgb(0 0 0 / 0.15)', padding: '20px' }}
                />
                <Bar dataKey="count" radius={[18, 18, 18, 18]} barSize={65} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Mix Pie */}
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all min-h-[480px] flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
               <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Global Category Mix</h3>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-0.5">System-wide categorical intelligence</p>
            </div>
            <div className="p-4 bg-slate-50 text-slate-400 rounded-3xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all border border-slate-100">
               <PieIcon size={22} />
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={125}
                  paddingAngle={12}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 30px -10px rgb(0 0 0 / 0.15)', padding: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
               <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 leading-none">Total Units</span>
               <span className="text-4xl font-black text-slate-900 leading-none tracking-tighter">{stats.total}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8 px-6">
              {pieData.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-2xl transition-all hover:bg-white hover:shadow-md cursor-default group/item">
                   <div className="w-3 h-3 rounded-full shadow-sm ring-4 ring-white group-hover/item:scale-125 transition-transform" style={{ background: COLORS[i % COLORS.length] }}></div>
                   <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{entry.name}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Row 4: Activity Stream and Power Shortcut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden group hover:shadow-2xl transition-all">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-[#fcfdff]/50">
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Live Access Stream</h3>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2.5 flex items-center gap-2">
                     <Activity size={16} className="text-indigo-600 animate-pulse" /> Finalized System Processing Queue
                  </p>
               </div>
               <Link to="/admin/requests" className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-xl hover:-rotate-12">
                  <ArrowUpRight size={20} />
               </Link>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-slate-50">
                    {requests.map((req, idx) => (
                      <tr key={req._id} className="hover:bg-indigo-50/20 transition-all group/row">
                        <td className="px-10 py-7 whitespace-nowrap">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm flex items-center justify-center text-indigo-600 font-black text-sm group-hover/row:scale-110 transition-transform">
                                 {req.user?.name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-sm font-black text-slate-900 leading-none mb-2">{req.user?.name}</span>
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Identity Verified</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-7">
                           <p className="text-sm font-black text-slate-900 leading-snug mb-1.5 transition-colors group-hover/row:text-indigo-600">{req.title}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Secure Timestamp</p>
                        </td>
                        <td className="px-10 py-7 text-right">
                           <div className={`text-[10px] font-black uppercase inline-flex px-5 py-2 rounded-full border shadow-sm ${
                              req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/5' :
                              req.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-500/5' :
                              'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/5'
                           }`}>
                              {req.status}
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>

          {/* Quick Stats Sidebar (The SaaS vibe) */}
          <div className="space-y-6">
             <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10 flex flex-col gap-8">
                   <div className="w-14 h-14 bg-white shadow-2xl rounded-2xl flex items-center justify-center text-slate-900 rotate-12 group-hover:rotate-0 transition-transform">
                      <Target size={28} />
                   </div>
                   <div className="space-y-4">
                      <h4 className="text-2xl font-black tracking-tight leading-none uppercase">Grid Sync</h4>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">System-wide data integrity is currently stable across all assignable clusters.</p>
                   </div>
                   <Link to="/admin/analytics" className="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 px-6 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all text-center">
                     Full Dataset Analytcs
                   </Link>
                </div>
             </div>
             
             <div className="bg-indigo-50 p-10 rounded-[3.5rem] border border-indigo-100 shadow-sm transition-all hover:shadow-xl group">
                <div className="flex items-center gap-6 mb-8">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-white group-hover:scale-110 transition-transform">
                      <ShieldCheck size={24} />
                   </div>
                   <div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Compliance</p>
                      <p className="text-base font-black text-slate-900 leading-none">Security Healthy</p>
                   </div>
                </div>
                <div className="space-y-3">
                   <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: '92%' }} 
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className="h-full bg-indigo-600"
                      ></motion.div>
                   </div>
                   <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <span>Trust Index</span>
                      <span className="text-indigo-600">92/100</span>
                   </div>
                </div>
             </div>
          </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
