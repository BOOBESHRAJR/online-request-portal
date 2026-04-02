import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Inbox, Send, User, Calendar, MessageSquare, 
  ChevronRight, Search, Loader2, ArrowLeft 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Messages | Request Portal";
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/messages');
      setMessages(res.data);
    } catch (error) {
      toast.error("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(msg => {
    const isSentByMe = msg.sender?._id === user.id;
    const isForInbox = activeTab === 'inbox' ? !isSentByMe : isSentByMe;
    const matchesSearch = msg.message?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          msg.request?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          msg.sender?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return isForInbox && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto pb-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-[10px] mb-1">
             <MessageSquare size={14} /> Global Communication
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Messages Center</h1>
          <p className="text-slate-500 font-medium max-w-lg">Manage all your request communications in one place with our integrated email-style system.</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 mb-8 flex flex-col md:flex-row items-center gap-4">
        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          {[
            { id: 'inbox', label: 'Inbox', icon: Inbox },
            { id: 'sent', label: 'Sent', icon: Send }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              {tab.id === 'inbox' && messages.filter(m => m.sender?._id !== user.id).length > 0 && (
                <span className="ml-1 w-2 h-2 rounded-full bg-blue-600 shadow-sm animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full md:w-auto group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search messages, requests, or users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-800 text-[15px]"
          />
        </div>
      </div>

      {/* Message List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
             <Loader2 className="animate-spin text-blue-600" size={40} />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading correspondence...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="py-24 text-center max-w-md mx-auto animate-in zoom-in-95 duration-500">
             <div className="bg-slate-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-inner rotate-3">
                {activeTab === 'inbox' ? <Inbox className="text-slate-300" size={40} /> : <Send className="text-slate-300" size={40} />}
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2">No {activeTab} messages</h3>
             <p className="text-slate-500 font-medium mb-8">
               {searchTerm ? "We couldn't find any messages matching your search." : `Your ${activeTab} is currently empty. All request-related communications will appear here.`}
             </p>
             {searchTerm && (
               <button 
                 onClick={() => setSearchTerm('')}
                 className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-blue-600 shadow-lg shadow-slate-900/10"
               >
                 Clear Search
               </button>
             )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
             {filteredMessages.map((msg, index) => (
               <motion.div
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: index * 0.05 }}
                 key={msg._id} 
                 className="group hover:bg-slate-50 transition-all duration-300 cursor-pointer"
               >
                 <Link to={`/request/${msg.request?._id}`} className="block p-6">
                    <div className="flex items-start gap-5">
                       {/* Avatar/Icon */}
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                         msg.sender?.role === 'admin' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-blue-50 border-blue-100 text-blue-600'
                       }`}>
                          <User size={20} />
                       </div>
                       
                       {/* Content */}
                       <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-4">
                             <div className="flex items-center gap-2 overflow-hidden">
                                <span className="font-black text-slate-900 truncate tracking-tight">{msg.sender?.name}</span>
                                {msg.sender?.role === 'admin' && (
                                   <span className="px-2 py-0.5 bg-indigo-600 text-[9px] font-black text-white rounded uppercase tracking-widest">Team</span>
                                )}
                             </div>
                             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                <Calendar size={12} />
                                {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                             Re: {msg.request?.title}
                          </div>
                          
                          <p className="text-slate-600 font-medium text-[15px] line-clamp-2 leading-relaxed mt-2 group-hover:text-slate-900 transition-colors">
                             {msg.message}
                          </p>
                       </div>
                       
                       {/* Arrow */}
                       <div className="self-center p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          <ChevronRight size={18} />
                       </div>
                    </div>
                 </Link>
               </motion.div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
