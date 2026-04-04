import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, Clock, XCircle, Inbox, 
  Search, Mail, ChevronRight, List, 
  Loader2, Filter, User, ShieldCheck,
  Plus, Trash2, Edit, Layers, PieChart as PieChartIcon,
  Check, X, Eye, ShieldAlert
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    document.title = "Admin Panel | Request Portal";
  }, []);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user) return;
      
      if (user.role !== 'admin') {
        setLoading(false);
        return;
      }
      
      try {
        const [statsRes, reqRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/requests')
        ]);
        setStats(statsRes.data);
        setRequests(reqRes.data);
      } catch (error) {
        console.error("Critical Admin Dashboard Fetch Error:", error);
        const errorMsg = error.response?.data?.message || "Internal system error while fetching admin data.";
        toast.error(`${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
    
    // Live Sync: Re-fetch every 1 second (Ultra-Fast)
    const interval = setInterval(fetchAdminData, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/admin/requests/${id}`, { status: newStatus });
      toast.success(`Request ${newStatus} successfully.`);
      setRequests(prev => prev.map(req => req._id === id ? { ...req, status: newStatus } : req));
      
      // Update local stats immediately
      setStats(prev => {
        const next = { ...prev };
        // This is a simple client-side update, will be overwritten by next fetch
        return next;
      });
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update status to ${newStatus}`);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request permanently?")) return;
    try {
      console.log('Sending delete request for ID:', id);
      await api.delete(`/admin/request/${id}`);
      toast.success("Request deleted successfully.");
      setRequests(requests.filter(req => req._id !== id));
      setStats(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error(`Delete failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const filteredRequests = requests
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter(req => {
      const searchLow = searchTerm.toLowerCase();
      const matchesSearch = 
        req.title.toLowerCase().includes(searchLow) ||
        (req.user?.name || '').toLowerCase().includes(searchLow) ||
        (req.user?.email || '').toLowerCase().includes(searchLow);
      
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || req.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
      <p className="text-slate-500 font-medium tracking-tight">Loading admin panel...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Professional Oversight Header */}
      <div className="relative bg-[#0f172a] rounded-3xl p-8 sm:px-12 sm:py-10 overflow-hidden shadow-2xl border border-white/5 group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] -mr-64 -mt-64 transition-all group-hover:bg-blue-600/10"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] shadow-sm">
                Admin Panel
              </span>
              <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Oversight Active</span>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-5xl font-black text-white tracking-tight leading-none">System Oversight</h1>
              <p className="text-slate-400 text-lg font-medium max-w-xl">Comprehensive administrative control and real-time request management center.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="h-16 w-[1px] bg-white/10 hidden lg:block"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Authenticated As</span>
              <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl p-2 pr-4 backdrop-blur-md">
                <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black text-xs">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-black text-white leading-none mb-1">{user?.name}</p>
                  <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest leading-none">Super Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50', icon: Inbox },
          { label: 'Pending Review', value: stats.pending, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock },
          { label: 'Approved', value: stats.approved, color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-600', bg: 'bg-red-50', icon: XCircle }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md group">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shadow-sm transition-transform group-hover:scale-110`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Visual Analytics: Category Mix */}
      {stats.total > 0 && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all animate-in slide-in-from-bottom-4 duration-700 delay-150">
             <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                   <Layers size={20} />
                </div>
                <div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Category Distribution</h3>
                   <p className="text-[10px] font-bold text-slate-400">Total volume by request type</p>
                </div>
             </div>
             <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={stats.categoryCounts?.map(c => ({ name: c._id, value: c.count })) || []}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={90}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {stats.categoryCounts?.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={['#6366f1', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'][index % 5]} />
                     ))}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                     itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                   />
                 </PieChart>
               </ResponsiveContainer>
             </div>
        </div>
      )}

      {/* Request Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-sm">
        <div className="p-6 border-b border-slate-100 space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <List className="text-blue-600" size={20} />
                 <h2 className="text-lg font-extrabold text-slate-900">Request Queue</h2>
              </div>
              <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {filteredRequests.length} results
              </div>
           </div>

           {/* Filters Bar */}
           <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search by title, requester or email..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl outline-none focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                   <Filter size={14} className="text-slate-400" />
                   <select 
                     className="bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/50 transition-all cursor-pointer"
                     value={statusFilter}
                     onChange={(e) => setStatusFilter(e.target.value)}
                   >
                     <option value="all">All Status</option>
                     <option value="pending">Pending</option>
                     <option value="approved">Approved</option>
                     <option value="rejected">Rejected</option>
                   </select>
                </div>

                <select 
                  className="bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/50 transition-all cursor-pointer"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="General Information">General Information</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Billing & Payments">Billing & Payments</option>
                  <option value="Document Retrieval">Document Retrieval</option>
                  <option value="Other">Other</option>
                </select>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {requests.length === 0 ? (
            <div className="py-24 text-center max-w-sm mx-auto animate-in fade-in duration-700">
               <div className="bg-emerald-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-emerald-100/50 shadow-xl shadow-emerald-500/5 -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <CheckCircle2 className="text-emerald-600" size={48} />
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">All caught up!</h3>
               <p className="text-slate-500 text-sm font-medium mb-2 leading-relaxed px-10">
                 The request queue is completely clear.
               </p>
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Great job, Admin.</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-24 text-center max-w-sm mx-auto animate-in zoom-in-95 duration-500">
               <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                  <Search className="text-slate-300" size={32} />
               </div>
               <h3 className="text-xl font-extrabold text-slate-900 mb-2">No results found</h3>
               <p className="text-slate-500 text-sm font-medium mb-8">No requests match your current filters or search query.</p>
               <button 
                  onClick={() => { setSearchTerm(''); setStatusFilter('all'); setCategoryFilter('all'); }}
                  className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all hover:bg-blue-600"
               >
                  Clear all filters
               </button>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc] border-b border-slate-100">
                <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-4">Request Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Requester</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right pr-10">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-blue-50/20 transition-all duration-300 group border-l-4 border-l-transparent hover:border-l-blue-500">
                    <td className="px-6 py-5">
                       <p className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[200px] leading-tight mb-1">{req.title}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ID: {req._id.substring(req._id.length - 8).toUpperCase()}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black uppercase tracking-tight text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
                        {req.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-black border border-slate-200">
                            {req.user?.name?.charAt(0)}
                         </div>
                         <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900 leading-none mb-1">{req.user?.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 leading-none">{req.user?.email}</span>
                         </div>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-slate-500 font-bold text-xs">
                       {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5">
                      <motion.span 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest shadow-sm ${getStatusColor(req.status)}`}
                      >
                        {req.status}
                      </motion.span>
                    </td>
                    <td className="px-6 py-5 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Status Quick Actions (Power Features) */}
                        {req.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusUpdate(req._id, 'approved')}
                              className="h-10 px-3 flex items-center gap-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-tight"
                              title="Quick Approve"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(req._id, 'rejected')}
                              className="h-10 px-3 flex items-center gap-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-tight"
                              title="Quick Reject"
                            >
                              <X size={14} /> Reject
                            </button>
                          </>
                        )}

                        <div className="w-[2px] h-6 bg-slate-100 mx-1"></div>

                        <Link 
                          to={`/request/${req._id}`} 
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white border border-slate-100 transition-all shadow-sm"
                          title="Full Review"
                        >
                          <Eye size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDeleteRequest(req._id)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-600 hover:text-white border border-slate-100 transition-all shadow-sm"
                          title="Delete Request"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
