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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500 pb-10">
      
      {/* Search Header */}
      <div className="bg-[#0f172a] rounded-[2rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-125"></div>
         
         <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8">
            <div>
               <h1 className="text-3xl font-black text-white tracking-tight leading-none">All Requests Queue</h1>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                  <Database size={14} className="text-blue-500" /> Administrative Storage Control
               </p>
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
               <div className="px-5 py-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Queue Size</p>
                  <p className="text-xl font-black text-white leading-none">{filteredRequests.length} Items</p>
               </div>
            </div>
         </div>

         {/* Filter Controls Redesign */}
         <div className="relative z-10 flex flex-col lg:flex-row gap-4 bg-white p-3 rounded-[1.5rem] shadow-xl">
            <div className="flex-1 relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                  type="text" 
                  placeholder="Search by title, requester or ID..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold text-slate-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="flex flex-wrap gap-3">
               <select 
                  className="px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 outline-none focus:bg-white cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
               >
                  <option value="all">Status Filters</option>
                  <option value="pending">Pending Only</option>
                  <option value="approved">Approved Samples</option>
                  <option value="rejected">Rejected Items</option>
               </select>

               <select 
                  className="px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 outline-none focus:bg-white cursor-pointer"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
               >
                  <option value="all">All Categories</option>
                  <option value="General Information">General Info</option>
                  <option value="Technical Support">Technical</option>
                  <option value="Billing & Payments">Financial</option>
                  <option value="Document Retrieval">Auditing</option>
                  <option value="Other">Custom Type</option>
               </select>
            </div>
         </div>
      </div>

      {/* Main Stream Queue */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
           <table className="w-full text-left">
              <thead className="bg-[#fcfdff] border-b border-slate-100">
                <tr className="text-slate-400 text-[9px] font-black uppercase tracking-widest">
                  <th className="px-6 py-5">Identity Control</th>
                  <th className="px-6 py-5">Request Documentation</th>
                  <th className="px-6 py-5">Category</th>
                  <th className="px-6 py-5">Timeline</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right pr-10">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50 transition-all group animate-in fade-in duration-300 border-l-[4px] border-l-transparent hover:border-l-blue-600">
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
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRequests;
