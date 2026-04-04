import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { 
  BarChart as BarIcon, 
  PieChart as PieIcon, 
  Loader2, 
  Activity, 
  ShieldCheck, 
  Download,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Target,
  AreaChart as AreaIcon
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  AreaChart, Area
} from 'recharts';
import toast from 'react-hot-toast';

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (error) {
        toast.error("Analytics fetch error.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const barData = [
    { name: 'Pending Review', count: stats?.pending || 0 },
    { name: 'Approved System', count: stats?.approved || 0 },
    { name: 'Rejected Control', count: stats?.rejected || 0 }
  ];

  const pieData = stats?.categoryCounts?.map(c => ({ name: c._id, value: c.count })) || [];
  const trendData = stats?.timelineTrend || [];
  const COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Processing System Analytics...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="space-y-10 animate-in zoom-in-95 duration-500 pb-16"
    >
      
      {/* Analytics Central Header */}
      <div className="relative bg-[#0a0f1e] rounded-[3rem] p-12 overflow-hidden shadow-2xl border border-white/5 group">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -mr-64 -mt-64 transition-transform duration-1000 group-hover:scale-110"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -ml-40 -mb-40"></div>

         <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="space-y-6">
               <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-[1.25rem] text-[11px] font-black text-blue-400 uppercase tracking-[0.25em] backdrop-blur-3xl shadow-inner">
                  <Activity size={16} className="animate-pulse" /> Global Analytics Oversight
               </div>
               <h1 className="text-5xl font-black text-white tracking-tighter leading-none">System Intelligence</h1>
               <p className="text-slate-400 text-lg font-medium max-w-xl leading-relaxed">Advanced analytics terminal providing deep visibility into processing throughput and global category distribution vectors.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
               <button className="px-10 py-5 bg-blue-600 hover:bg-blue-500 hover:scale-105 hover:shadow-blue-500/40 transition-all text-white rounded-[1.75rem] font-black text-xs uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-95">
                  <Download size={20} /> Export Dataset
               </button>
            </div>
         </div>
      </div>

      {/* Requests Timeline Trend */}
      <motion.div 
         initial={{ opacity: 0, scale: 0.98 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ delay: 0.1 }}
         className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm relative group hover:shadow-2xl transition-all"
      >
         <div className="flex items-center justify-between mb-12">
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">7-Day Access Momentum</h3>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2 ml-0.5">Chronological system request flow vectors</p>
               </div>
               <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl shadow-sm ring-8 ring-blue-50 group-hover:rotate-12 transition-transform">
                  <AreaIcon size={26} />
               </div>
         </div>
         <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                     <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                     dataKey="date" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fill: '#334155', fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }} 
                     height={50}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                  <Tooltip 
                     contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 30px 40px -15px rgb(0 0 0 / 0.15)', padding: '20px' }}
                     itemStyle={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase' }}
                  />
                  <Area 
                     type="monotone" 
                     dataKey="requests" 
                     stroke="#6366f1" 
                     strokeWidth={4} 
                     fillOpacity={1} 
                     fill="url(#colorRequests)" 
                     animationDuration={2500}
                  />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </motion.div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         
         {/* Detailed Throughput Analysis */}
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm relative group hover:shadow-2xl transition-all"
         >
            <div className="flex items-center justify-between mb-12">
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Processing Output</h3>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2 ml-0.5">Live Throughput status Matrix</p>
               </div>
               <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl shadow-sm ring-8 ring-indigo-50 group-hover:scale-110 transition-transform">
                  <BarIcon size={26} />
               </div>
            </div>
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#334155', fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }} 
                        height={50}
                     />
                     <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                     <Tooltip 
                        cursor={{ fill: '#f8fafc', radius: 15 }}
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 30px 40px -15px rgb(0 0 0 / 0.15)', padding: '20px' }}
                        itemStyle={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase' }}
                     />
                     <Bar 
                        dataKey="count" 
                        barSize={70} 
                        radius={[20, 20, 20, 20]}
                        animationDuration={2000}
                     >
                        <Cell fill="#fcd34d" />
                        <Cell fill="#34d399" />
                        <Cell fill="#fb7185" />
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </motion.div>

         {/* Distribution Strategy Chart */}
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm transition-all hover:shadow-2xl relative group"
         >
            <div className="flex items-center justify-between mb-12">
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Intelligence Density</h3>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2 ml-0.5">Global Category vector Distribution</p>
               </div>
               <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl shadow-sm ring-8 ring-blue-50 group-hover:scale-110 transition-transform">
                  <PieIcon size={26} />
               </div>
            </div>
            <div className="h-80 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={12}
                        dataKey="value"
                        animationDuration={2000}
                     >
                        {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity outline-none" />
                        ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 30px 40px -15px rgb(0 0 0 / 0.15)', padding: '20px' }}
                        itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}
                     />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 leading-none">Total Units</p>
                  <p className="text-4xl font-black text-slate-900 leading-none tracking-tighter">{stats?.total || 0}</p>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-5 mt-10 px-6">
               {pieData.map((entry, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group/item">
                     <div className="w-3.5 h-3.5 rounded-full shadow-sm ring-4 ring-white group-hover/item:scale-125 transition-transform" style={{ background: COLORS[i % COLORS.length] }}></div>
                     <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{entry.name}</p>
                     <p className="ml-auto text-sm font-black text-slate-900">{entry.value}</p>
                  </div>
               ))}
            </div>
         </motion.div>
      </div>

   </motion.div>
  );
};

export default AdminAnalytics;
