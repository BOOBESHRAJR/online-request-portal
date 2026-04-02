import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  FileText, CheckCircle2, Clock, XCircle, 
  Plus, Loader2, ChevronRight, Inbox,
  Calendar, Search, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "Dashboard | Request Portal";
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, reqRes] = await Promise.all([
          api.get('/requests/stats'),
          api.get('/requests')
        ]);
        setStats(statsRes.data);
        setRequests(reqRes.data);
      } catch (error) {
        toast.error("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const filteredRequests = requests
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter(req => {
      const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           req.description.toLowerCase().includes(searchTerm.toLowerCase());
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
      <p className="text-slate-500 font-medium tracking-tight">Loading your dashboard...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Compact Gradient Banner Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:px-8 sm:py-7 overflow-hidden shadow-xl shadow-blue-500/10 border border-white/10">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
             <h1 className="text-2xl font-black text-white tracking-tight">
               Welcome back, <span className="text-blue-200">{user?.name?.split(' ')[0]}</span>
             </h1>
             <p className="text-blue-100/70 text-sm font-medium">Monitor and manage your active information requests in real-time.</p>
          </div>
          
          <button 
            onClick={() => navigate('/create-request')} 
            className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={16} /> New Request
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md group">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shadow-sm transition-transform group-hover:scale-110`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-bottom-6 duration-700 delay-100">
        <div className="p-6 border-b border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">Recent Activity</h2>
            <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase">
              {filteredRequests.length} results
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search requests..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl outline-none focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
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
               <div className="bg-blue-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-blue-100/50 shadow-xl shadow-blue-500/5 rotate-3 hover:rotate-0 transition-transform duration-500">
                  <Plus className="text-blue-600" size={48} />
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Ready to begin?</h3>
               <p className="text-slate-500 text-sm font-medium mb-10 leading-relaxed px-4">
                 It looks like you haven't submitted any requests yet. Start your journey by creating your very first information request.
               </p>
               <button 
                  onClick={() => navigate('/create-request')} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 active:scale-95"
               >
                 Create Your First Request
               </button>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-24 text-center max-w-sm mx-auto animate-in zoom-in-95 duration-500">
               <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                  <Search className="text-slate-300" size={32} />
               </div>
               <h3 className="text-xl font-extrabold text-slate-900 mb-2">No matches found</h3>
               <p className="text-slate-500 text-sm font-medium mb-8">Try adjusting your filters or search keywords to find what you're looking for.</p>
               <button 
                  onClick={() => { setSearchTerm(''); setStatusFilter('all'); setCategoryFilter('all'); }}
                  className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all hover:bg-blue-600"
               >
                  Clear search filters
               </button>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#F9FAFB] border-b border-slate-100">
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-4">Request Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Submission Date</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4 text-right pr-10">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-blue-50/30 transition-all duration-300 group">
                    <td className="px-6 py-5">
                      <p className="font-extrabold text-slate-900 text-[15px] group-hover:text-blue-600 transition-colors line-clamp-1">{req.title}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-0.5">#{req._id.slice(-8).toUpperCase()}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-600 transition-all">
                        {req.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                          <Calendar size={14} className="text-slate-300" />
                          {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                       </p>
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
                    <td className="px-6 py-5 text-right pr-6">
                      <Link 
                        to={`/request/${req._id}`} 
                        className="inline-flex items-center justify-center w-10 h-10 bg-slate-50 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl transition-all shadow-sm border border-slate-100 active:scale-90"
                      >
                        <ChevronRight size={18} />
                      </Link>
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

export default UserDashboard;
