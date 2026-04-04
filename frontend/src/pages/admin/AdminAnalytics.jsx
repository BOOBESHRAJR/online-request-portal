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
  Target
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
  const COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Processing System Analytics...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500 pb-10">
      
      {/* Analytics Central Header */}
      <div className="relative bg-gradient-to-r from-slate-900 to-indigo-900 rounded-[2.5rem] p-10 overflow-hidden shadow-2xl border border-white/5">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -mr-64 -mt-64 transition-transform duration-700 group-hover:scale-125"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>

         <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 border border-white/10 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest backdrop-blur-md">
                  <Activity size={14} /> Analytics Oversight
               </div>
               <h1 className="text-5xl font-black text-white tracking-tight leading-none">System Intelligence</h1>
               <p className="text-slate-300 text-lg font-medium max-w-xl">Deep analytics insight into system throughput and category distribution trends.</p>
            </div>
            <button className="px-8 py-4 bg-blue-600 hover:bg-white hover:text-blue-600 transition-all text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95">
               <Download size={18} /> Export Intel Report
            </button>
         </div>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* Detailed Throughput Analysis */}
         <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative group transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Processing Throughput</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live Categorical Status Matrix</p>
               </div>
               <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <BarIcon size={24} />
               </div>
            </div>
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#334155', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} 
                     />
                     <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                     <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 30px -10px rgb(0 0 0 / 0.15)' }}
                        itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                     />
                     <Bar 
                        dataKey="count" 
                        barSize={60} 
                        radius={[16, 16, 0, 0]}
                     >
                        <Cell fill="#fcd34d" />
                        <Cell fill="#34d399" />
                        <Cell fill="#fb7185" />
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Distribution Strategy Chart */}
         <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Intelligence Density</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Global System Category Distribution</p>
               </div>
               <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <PieIcon size={24} />
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
                        paddingAngle={10}
                        dataKey="value"
                     >
                        {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 30px -10px rgb(0 0 0 / 0.15)' }}
                        itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                     />
                  </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8 px-10">
               {pieData.map((entry, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                     <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: COLORS[i % COLORS.length] }}></div>
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{entry.name}</p>
                     <p className="ml-auto text-xs font-black text-slate-900">{entry.value}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
