import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { 
  CheckCircle2, Clock, XCircle, Search, 
  ChevronRight, List, Loader2, Filter, 
  ShieldCheck, Trash2, Edit, Mail, 
  Eye, Check, X, ShieldAlert, Database,
  ArrowBigRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/requests');
      setRequests(res.data);
    } catch (error) {
      toast.error("Failed to fetch requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/admin/requests/${id}`, { status: newStatus });
      toast.success(`Request ${newStatus} successfully.`);
      setRequests(prev => prev.map(req => req._id === id ? { ...req, status: newStatus } : req));
    } catch (error) {
      toast.error("Update failed.");
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm("Delete permanently?")) return;
    try {
      await api.delete(`/admin/request/${id}`);
      toast.success("Request deleted.");
      setRequests(requests.filter(req => req._id !== id));
    } catch (error) {
      toast.error("Delete failed.");
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Filtering Queue...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500 pb-10"
    >
      
      {/* Search Header */}
      <div className="bg-[#0f172a] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-110"></div>
         
         <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
            <div>
               <h1 className="text-4xl font-black text-white tracking-tight leading-none">Global Request Queue</h1>
               <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.25em] mt-3 flex items-center gap-2">
                  <Database size={14} className="text-blue-500 animate-pulse" /> 
                  Unified Administrative Intel Repository
               </p>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-3 rounded-3xl border border-white/10 backdrop-blur-xl shadow-inner">
               <div className="px-6 py-2 border-r border-white/10">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">Total Volume</p>
                  <p className="text-2xl font-black text-white leading-none tracking-tighter">{filteredRequests.length}</p>
               </div>
               <div className="pr-6">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">Live Status</p>
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-400 leading-none">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                     Healthy
                  </div>
               </div>
            </div>
         </div>

         {/* Filter Controls Redesign */}
         <div className="relative z-10 flex flex-col lg:flex-row gap-5 bg-white p-4 rounded-[2rem] shadow-2xl">
            <div className="flex-1 relative group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
               <input 
                  type="text" 
                  placeholder="Query by title, requester identity or system ID..."
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold text-slate-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="flex flex-wrap gap-4">
               <div className="relative">
                  <select 
                     className="appearance-none px-6 py-4 bg-slate-50 border-none rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 cursor-pointer pr-12 min-w-[180px] shadow-sm transition-all"
                     value={statusFilter}
                     onChange={(e) => setStatusFilter(e.target.value)}
                  >
                     <option value="all">Any Status</option>
                     <option value="pending">Pending Review</option>
                     <option value="approved">Approved Assets</option>
                     <option value="rejected">Rejected Entries</option>
                  </select>
                  <Filter size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
               </div>

               <div className="relative">
                  <select 
                     className="appearance-none px-6 py-4 bg-slate-50 border-none rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 cursor-pointer pr-12 min-w-[180px] shadow-sm transition-all"
                     value={categoryFilter}
                     onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                     <option value="all">All Channels</option>
                     <option value="General Information">General Insight</option>
                     <option value="Technical Support">Tech Protocol</option>
                     <option value="Billing & Payments">Financial Log</option>
                     <option value="Document Retrieval">Data Audit</option>
                     <option value="Other">Standard Type</option>
                  </select>
                  <Layers size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
               </div>
            </div>
         </div>
      </div>

      {/* Main Stream Queue */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden group/container">
        <div className="overflow-x-auto min-h-[500px]">
           <table className="w-full text-left border-collapse">
              <thead className="bg-[#fcfdff] border-b border-slate-100">
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">
                  <th className="px-8 py-6">Identity Key</th>
                  <th className="px-8 py-6">Documentation Context</th>
                  <th className="px-8 py-6">Classification</th>
                  <th className="px-8 py-6">Chronology</th>
                  <th className="px-8 py-6">State</th>
                  <th className="px-8 py-6 text-right pr-12">Administrative Logic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRequests.map((req, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={req._id} 
                    className="hover:bg-blue-50/30 transition-all group border-l-[6px] border-l-transparent hover:border-l-blue-600"
                  >
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-xs shadow-sm group-hover:scale-110 transition-transform">
                             {req.user?.name?.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-xs font-black text-slate-900 leading-none mb-1.5">{req.user?.name}</span>
                             <span className="text-[10px] font-bold text-slate-400 leading-none">{req.user?.email}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-xs font-black text-slate-900 truncate max-w-[200px] leading-tight mb-1">{req.title}</p>
                       <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">ID: {req._id.slice(-8).toUpperCase()}</p>
                    </td>
                    <td className="px-6 py-5">
                       <span className="px-3 py-1.5 bg-slate-100/50 border border-slate-200 rounded-lg text-[9px] font-black uppercase text-slate-500 tracking-tight">
                         {req.category}
                       </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                       <p className="text-[10px] font-black text-slate-600 leading-none mb-1">
                          {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                       </p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Entry Stamped</p>
                    </td>
                    <td className="px-6 py-5">
                       <div className={`text-[9px] font-black uppercase inline-flex px-4 py-1.5 rounded-full border shadow-sm ${
                          req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/5' :
                          req.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-500/5' :
                          'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/5'
                       }`}>
                          {req.status}
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        {req.status === 'pending' && (
                          <div className="flex items-center gap-1.5 mr-2">
                             <button 
                                onClick={() => handleStatusUpdate(req._id, 'approved')}
                                className="h-9 px-3 flex items-center gap-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-tight border border-emerald-100"
                                title="Authorize"
                             >
                                <Check size={14} /> Authorize
                             </button>
                             <button 
                                onClick={() => handleStatusUpdate(req._id, 'rejected')}
                                className="h-9 px-3 flex items-center gap-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-tight border border-rose-100"
                                title="Decline"
                             >
                                <X size={14} /> Decline
                             </button>
                          </div>
                        )}
                        <Link 
                          to={`/request/${req._id}`} 
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-lg"
                        >
                          <ArrowBigRight size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDeleteRequest(req._id)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-rose-600 hover:text-white transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
           </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminRequests;
