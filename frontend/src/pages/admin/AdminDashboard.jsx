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
  ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
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
     categoryCounts: [] 
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, reqRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/requests')
        ]);
        setStats(statsRes.data);
        setRequests(reqRes.data.slice(0, 5)); // Just recent items
      } catch (error) {
        toast.error("Dashboard error.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 5000); // 5 sec live refresh
    return () => clearInterval(interval);
  }, []);

  const barData = [
    { name: 'Pending', count: stats.pending, fill: '#f59e0b' },
    { name: 'Approved', count: stats.approved, fill: '#10b981' },
    { name: 'Rejected', count: stats.rejected, fill: '#ef4444' }
  ];

  const pieData = stats.categoryCounts?.map(c => ({ name: c._id, value: c.count })) || [];
  const COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading System Control...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* SaaS Header Profile */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
         <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">System Oversight</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
               <ShieldAlert size={14} className="text-blue-600" /> Administrative Command Center
            </p>
         </div>
         <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200">
             <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black shadow-lg">
                {user?.name?.charAt(0)}
             </div>
             <div className="pr-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 leading-none">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   Oversight Active
                </div>
             </div>
         </div>
      </div>

      {/* Row 1: Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'System Queue', value: stats.total, icon: Inbox, color: 'text-indigo-600', bg: 'bg-indigo-50/50', change: '+12%', up: true },
          { label: 'Pending Audit', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/50', change: 'Live', up: true },
          { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/50', change: '84%', up: true },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50/50', change: '7%', up: false }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-20 h-20 ${stat.bg} rounded-bl-full opacity-50 -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-500`}></div>
            <div className="flex items-start justify-between relative z-10 mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} shadow-sm border border-slate-100/50`}>
                <stat.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${stat.up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {stat.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {stat.change}
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 leading-none tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Status Bar Chart */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Request Througput</h3>
              <p className="text-[10px] font-bold text-slate-400">Total volume by status category</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
               <BarIcon size={18} />
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                   dataKey="name" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} 
                />
                <YAxis hide />
                <Tooltip 
                   cursor={{ fill: '#f8fafc' }}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                   itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                />
                <Bar dataKey="count" radius={[12, 12, 12, 12]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Category Pie Chart */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Category Mix</h3>
              <p className="text-[10px] font-bold text-slate-400">Distribution across request types</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
               <PieIcon size={18} />
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                   itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              {pieData.map((entry, i) => (
                <div key={i} className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></div>
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{entry.name}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activity */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
           <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Recent Activity Stream</h3>
              <p className="text-[10px] font-bold text-slate-400">Snapshot of latest system entries</p>
           </div>
           <Link 
              to="/admin/requests" 
              className="px-4 py-2 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
           >
              View Full Queue
           </Link>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-[#fcfdff] border-b border-slate-100">
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-4">Requester Identity</th>
                  <th className="px-6 py-4">Title & Context</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Processing Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-extrabold text-[10px] border border-slate-200">
                             {req.user?.name?.charAt(0)}
                          </div>
                          <div>
                             <p className="text-xs font-black text-slate-900 leading-none mb-1">{req.user?.name}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">{req.user?.email}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{req.title}</p>
                    </td>
                    <td className="px-6 py-4">
                       <span className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-black uppercase text-slate-500">
                         {req.category}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className={`text-[9px] font-black uppercase inline-flex px-3 py-1 rounded-full border ${
                          req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          req.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
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
    </div>
  );
};

export default AdminDashboard;
