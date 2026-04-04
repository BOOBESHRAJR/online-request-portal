import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { 
  FileText, Send, AlertCircle, Loader2, ArrowLeft,
  CheckCircle2, Info, Layout, TextQuote, Tag, Save, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const EditRequest = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General Information'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const categories = [
    'General Information',
    'Technical Support',
    'Billing & Payments',
    'Document Retrieval',
    'Other'
  ];

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await api.get(`/requests/${id}`);
        setFormData({
          title: res.data.title,
          description: res.data.description,
          category: res.data.category
        });
        document.title = `Edit: ${res.data.title} | Request Portal`;
      } catch (error) {
        toast.error("Failed to load request data.");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.put(`/requests/${id}`, formData);
      toast.success('Request updated successfully.');
      navigate(`/request/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
      <p className="text-slate-500 font-medium">Loading request details...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="group flex items-center gap-3 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200 group-hover:border-blue-200 transition-colors">
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> 
          </div>
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2.5 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 shadow-sm">
           <Info size={14} className="text-blue-600" />
           <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Editing Mode Enabled</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Side */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
             <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                   <Save size={24} />
                </div>
                <div>
                   <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Request</h1>
                   <p className="text-slate-500 text-sm font-medium">Refine your request details for clearer resolution.</p>
                </div>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Title */}
            <div className="space-y-2">
              <div className="flex justify-between ml-1">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Layout size={14} className="text-blue-600" /> Request Title
                </label>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Required</span>
              </div>
              <input 
                type="text" 
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all text-[15px] font-bold text-slate-700"
                placeholder="What do you need help with?"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <Tag size={14} className="text-blue-600" /> Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                 {categories.map(cat => (
                   <button
                     key={cat}
                     type="button"
                     onClick={() => setFormData({...formData, category: cat})}
                     className={`px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border-2
                       ${formData.category === cat 
                         ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' 
                         : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-600'}`}
                   >
                     {cat}
                   </button>
                 ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                 <TextQuote size={14} className="text-blue-600" /> Description
              </label>
              <textarea 
                rows="6"
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all text-[15px] font-medium text-slate-700 resize-none leading-relaxed"
                placeholder="Provide as much detail as possible to help our team assist you..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="button"
                onClick={() => navigate(`/request/${id}`)}
                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Update Request
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Tips */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <h3 className="text-xl font-black mb-4 relative z-10">Editing Tips</h3>
              <ul className="space-y-5 relative z-10">
                {[
                  { icon: AlertCircle, text: "Be specific in your title to help us identify the issue quickly." },
                  { icon: CheckCircle2, text: "Adding clear steps to your description speeds up resolution." },
                  { icon: Info, text: "Make sure yours is assigned to the most relevant category." }
                ].map((tip, i) => (
                  <li key={i} className="flex gap-4 items-start group">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <tip.icon size={16} className="text-blue-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-300 leading-relaxed pt-1">{tip.text}</p>
                  </li>
                ))}
              </ul>
           </div>

           <div className="p-8 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-center mb-4">
                 <Layout className="text-indigo-600" size={28} />
              </div>
              <h4 className="font-black text-indigo-900 mb-2">Need a new request?</h4>
              <p className="text-xs font-semibold text-indigo-500 leading-relaxed mb-6 px-4">
                If the scope has changed significantly, it might be better to create a new request instead.
              </p>
              <button 
                 onClick={() => navigate('/create-request')}
                 className="w-full py-3 bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 border border-indigo-200 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm"
              >
                 Create New
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EditRequest;
