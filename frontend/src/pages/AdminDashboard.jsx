import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, Clock, XCircle, Inbox, 
  Search, Mail, ChevronRight, List, 
  Loader2, Filter, User, ShieldCheck,
  Plus, Trash2, Edit
} from 'lucide-react';
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
      {/* Compact Admin Banner Header */}
      <div className="relative bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-6 sm:px-10 sm:py-7 overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-widest text-[10px] mb-1">
               <ShieldCheck size={14} /> Administrative Control
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">System Oversight</h1>
            <p className="text-slate-300 font-medium">Monitor and manage all system activity from your command center.</p>
          </div>
        </div>
          
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 animate-pulse">
                <Clock size={16} />
              </div>
              <div className="pr-3">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Status</p>
                 <p className="text-xs font-black text-white leading-none">Live Sync</p>
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
              <thead className="bg-[#F9FAFB] border-b border-slate-100">
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-4">Title & Requester</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Submitted On</th>
                  <th className="px-6 py-4 text-right pr-10">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-blue-50/30 transition-all duration-300 group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-slate-900 font-black text-xs border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {req.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[200px] leading-none mb-1.5">{req.title}</p>
                          <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 leading-none">
                            <Mail size={12} className="text-slate-300" /> {req.user?.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-600 transition-all">
                        {req.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <motion.span 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase border-2 tracking-widest shadow-sm ${getStatusColor(req.status)}`}
                      >
                        {req.status}
                      </motion.span>
                    </td>
                    <td className="px-6 py-5 text-slate-500 font-bold text-xs">
                       {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/request/${req._id}`} 
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white border border-slate-100 transition-all shadow-sm"
                          title="Review & Update"
                        >
                          <Edit size={16} />
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
