import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Paperclip, Send, File, Image as ImageIcon, Download, 
  Loader2, MessageCircle, CheckCircle2, XCircle, Clock, 
  ArrowLeft, User, Calendar, ShieldCheck, FileText, Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const RequestDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [adminReply, setAdminReply] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchData = async () => {
    try {
      const [reqRes, msgRes] = await Promise.all([
        api.get(`/requests/${id}`),
        api.get(`/messages/${id}`)
      ]);
      setRequest(reqRes.data);
      setAdminReply(reqRes.data.adminReply || '');
      setMessages(msgRes.data);
    } catch (error) {
      toast.error("Could not load request details.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (request?.title) {
      document.title = `${request.title} | Request Portal`;
    } else {
      document.title = "Request Details | Request Portal";
    }
  }, [request?.title]);

  const handleMessageSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !attachment) return;

    try {
      setSendingMsg(true);
      const formData = new FormData();
      formData.append('message', newMessage);
      if (attachment) formData.append('attachment', attachment);

      await api.post(`/messages/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setNewMessage('');
      setAttachment(null);
      
      const msgRes = await api.get(`/messages/${id}`);
      setMessages(msgRes.data);
    } catch (error) {
      toast.error('Failed to send message.');
    } finally {
      setSendingMsg(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      setStatusLoading(true);
      await api.put(`/admin/requests/${id}`, { status, adminReply });
      toast.success(`Request ${status} successfully.`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  };

  if (!request) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
      <p className="text-slate-500 font-medium">Loading details...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header / Breadcrumbs */}
      <div className="flex items-center justify-between px-2">
        <Link to={user?.role === 'admin' ? "/admin" : "/dashboard"} className="group inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Portal
        </Link>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
           Server Status: <span className="text-emerald-500">Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Detail Sidebar - Modern Card UI */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl p-8 space-y-8 animate-in slide-in-from-left-6 duration-700">
            
            {/* Request Header Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                 <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100 shadow-sm">
                   {request.category}
                 </span>
                 <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                   #{request._id.slice(-8).toUpperCase()}
                 </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight mb-4">
                {request.title}
              </h2>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-500">
                   <Calendar size={14} className="text-slate-300" />
                   <span className="text-[11px] font-bold">
                     {new Date(request.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                   </span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                   <Clock size={14} className="text-slate-300" />
                   <span className="text-[11px] font-bold">
                     {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="pt-8 border-t border-slate-50 space-y-4">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                 <CheckCircle2 size={12} className="text-blue-500" /> Live Processing Status
               </h3>
               <AnimatePresence mode="wait">
                 <motion.div 
                   key={request.status}
                   initial={{ scale: 0.9, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   transition={{ type: "spring", stiffness: 400, damping: 20 }}
                   className={`
                     p-5 rounded-2xl flex items-center justify-between border-2 shadow-inner transition-all duration-500
                     ${request.status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
                       request.status === 'rejected' ? 'bg-rose-50 border-rose-100 text-rose-700' : 
                       'bg-amber-50 border-amber-100 text-amber-700'}
                   `}
                 >
                   <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center">
                         {request.status === 'approved' ? <CheckCircle2 size={24} className="text-emerald-600" /> : 
                          request.status === 'rejected' ? <XCircle size={24} className="text-rose-600" /> : 
                          <Clock size={24} className="text-amber-600" />}
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1.5">{request.status}</p>
                         <p className="text-[9px] font-bold opacity-60 leading-none">Last sync: moments ago</p>
                      </div>
                   </div>
                 </motion.div>
               </AnimatePresence>
            </div>

            {/* Description */}
            <div className="pt-8 border-t border-slate-50 space-y-4">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                 <File size={12} className="text-blue-500" /> Request Narrative
               </h3>
               <p className="text-slate-700 text-[14px] leading-relaxed font-semibold bg-slate-50/50 p-6 rounded-2xl border border-slate-100/30 whitespace-pre-wrap shadow-inner min-h-[120px]">
                 {request.description}
               </p>
            </div>

            {/* Requester Info */}
            <div className="pt-8 border-t border-slate-50">
               <div className="flex items-center gap-4 group cursor-help">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 font-black text-sm border-2 border-white shadow-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                    {request.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Submitted By</p>
                    <p className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">{request.user?.name}</p>
                  </div>
               </div>
            </div>

            {/* Attachments Section - High-Performance File Gallery */}
            {request.documents?.length > 0 && (
              <div className="pt-8 border-t border-slate-50 space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                   <Paperclip size={12} className="text-blue-500" /> Request Archive
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {request.documents.map((doc, i) => {
                    const hasLegacyPath = !!doc.path;
                    const docUrl = hasLegacyPath 
                      ? (doc.path.startsWith('http') ? doc.path : `/${doc.path}`)
                      : `${import.meta.env.VITE_API_URL || '/api'}/requests/${request._id}/document/${doc._id}?token=${user.token}`;
                    
                    const docType = doc.contentType || doc.mimetype;
                    const isImage = docType ? docType.startsWith('image/') : /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.filename);
                    
                    return (
                      <div key={i} className="group bg-white border-2 border-slate-50 rounded-2xl p-4 flex items-center justify-between hover:shadow-2xl hover:border-blue-500/10 transition-all duration-500">
                        <div className="flex items-center gap-4 overflow-hidden">
                           <div className="w-16 h-16 rounded-xl bg-slate-50 border-2 border-slate-100 overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                              {isImage ? (
                                <img src={docUrl} alt="prev" className="w-full h-full object-cover" />
                              ) : (
                                <FileText size={20} className="text-slate-400" />
                              )}
                           </div>
                           <div className="overflow-hidden">
                              <p className="text-sm font-black text-slate-900 truncate leading-none mb-1.5">{doc.filename}</p>
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">
                                {isImage ? 'Image Asset' : 'Document File'}
                              </p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <a 
                             href={docUrl} 
                             target="_blank" 
                             rel="noreferrer"
                             className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                             title="View File"
                           >
                              <Search size={16} />
                           </a>
                           <a 
                             href={docUrl} 
                             download
                             className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90 border border-transparent hover:border-blue-400"
                             title="Download"
                           >
                              <Download size={16} />
                           </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Admin Management Panel */}
            {user?.role === 'admin' && (
              <div className="pt-8 border-t border-slate-50 space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2 ml-1">
                   <ShieldCheck size={12} className="text-indigo-500" /> Admin Oversight
                </h3>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Decision Note / Private Reply</label>
                  <textarea 
                    rows="3"
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none leading-relaxed"
                    placeholder="Enter approval details, rejection reasons, or internal notes..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => updateStatus('approved')}
                     disabled={statusLoading}
                     className="flex flex-col items-center justify-center py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all shadow-xl shadow-emerald-600/25 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 disabled:opacity-50"
                   >
                     {statusLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={24} className="mb-1" />}
                     <span className="text-[10px] font-black uppercase tracking-widest">Save & Approve</span>
                   </button>
                   <button 
                     onClick={() => updateStatus('rejected')}
                     disabled={statusLoading}
                     className="flex flex-col items-center justify-center py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl transition-all shadow-xl shadow-rose-600/25 border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 disabled:opacity-50"
                   >
                     {statusLoading ? <Loader2 size={18} className="animate-spin" /> : <Clock size={24} className="mb-1" />}
                     <span className="text-[10px] font-black uppercase tracking-widest">Save & Reject</span>
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Messaging Area - Professional Interface */}
        <div className="lg:col-span-8 flex flex-col h-[750px] bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden relative">
          
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 sticky top-0">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                <MessageCircle size={24} />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg leading-tight">Support Chat</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F9FAFB] custom-scrollbar scroll-smooth">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-700">
                <div className="w-24 h-24 bg-white rounded-[2.5rem] border border-blue-50 shadow-xl shadow-blue-500/5 flex items-center justify-center mb-8 rotate-6 hover:rotate-0 transition-all duration-500 group">
                  <MessageCircle size={44} className="text-blue-100 group-hover:text-blue-500 transition-colors" />
                </div>
                <div className="text-center max-w-sm px-10">
                   <h3 className="text-slate-900 font-black text-2xl mb-2 tracking-tight">Need assistance?</h3>
                   <p className="text-slate-400 text-sm font-medium leading-relaxed">
                     Our support team is ready to help. Send a message below to start a conversation regarding this request.
                   </p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.sender._id === user?._id;
                const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                    {/* Sender Name */}
                    <span className={`text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                      {isMe ? 'You' : msg.sender.name}
                    </span>
                    
                    <div className={`relative max-w-[70%] group`}>
                      <div className={`
                        px-5 py-3.5 shadow-sm transition-all duration-300
                        ${isMe 
                          ? 'bg-[#3B82F6] text-white rounded-2xl rounded-tr-sm' 
                          : 'bg-[#E5E7EB] text-[#111827] rounded-2xl rounded-tl-sm'
                        }
                      `}>
                        {msg.message && <p className="text-[15px] leading-relaxed font-medium whitespace-pre-wrap">{msg.message}</p>}
                        
                        {msg.attachment && (() => {
                          const hasLegacyMsgPath = !!msg.attachment.path;
                          const msgAttachUrl = hasLegacyMsgPath 
                             ? (msg.attachment.path.startsWith('http') ? msg.attachment.path : `/${msg.attachment.path}`)
                             : `${import.meta.env.VITE_API_URL || '/api'}/messages/attachment/${msg._id}?token=${user.token}`;
                             
                          const msgAttachType = msg.attachment.contentType || msg.attachment.mimetype;
                          const msgIsImage = msgAttachType ? msgAttachType.startsWith('image/') : /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.attachment.filename);

                          return (
                          <div className={`mt-3 ${msg.message ? 'pt-3 border-t border-black/5' : ''}`}>
                             {msgIsImage ? (
                               <div className="rounded-xl overflow-hidden border border-black/5 bg-white/10 mb-1.5 cursor-pointer hover:opacity-95 transition-opacity"
                                    onClick={() => window.open(msgAttachUrl, '_blank')}>
                                 <img 
                                   src={msgAttachUrl} 
                                   alt="attachment" 
                                   className="max-h-72 w-full object-cover"
                                 />
                                 <div className="p-3 flex items-center justify-between text-[11px] font-bold">
                                     <span className="truncate opacity-80">{msg.attachment.filename}</span>
                                     <Download size={14} className="shrink-0" />
                                 </div>
                               </div>
                             ) : (
                               <a 
                                 href={msgAttachUrl} 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${isMe ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-white/50 border-slate-300 hover:bg-white'}`}
                               >
                                 <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isMe ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                                   <File size={20} className={isMe ? 'text-white' : 'text-slate-600'} />
                                 </div>
                                 <div className="overflow-hidden flex-1">
                                   <p className={`text-xs font-bold truncate ${isMe ? 'text-white' : 'text-slate-900'}`}>{msg.attachment.filename}</p>
                                   <p className={`text-[10px] font-black uppercase opacity-60 tracking-tighter ${isMe ? 'text-blue-100' : 'text-slate-500'}`}>Shared File</p>
                                 </div>
                                 <Download size={16} className="shrink-0 opacity-40" />
                               </a>
                             )}
                          </div>
                          );
                        })()}
                      </div>
                      
                      {/* Timestamp outside bubble as requested */}
                      <div className={`flex items-center gap-1.5 mt-1.5 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                           {formattedTime}
                         </span>
                         {isMe && <CheckCircle2 size={10} className="text-blue-500" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Footer / Input area */}
          <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.03)] z-10">
            {attachment && (
              <div className="bg-blue-50/90 border border-blue-100 px-5 py-3 rounded-2xl mb-5 flex items-center justify-between animate-in slide-in-from-bottom-6 duration-300">
                <div className="flex items-center gap-4 overflow-hidden">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
                       <Paperclip size={20} />
                   </div>
                   <div>
                       <p className="text-sm font-bold text-blue-900 truncate max-w-[250px]">{attachment.name}</p>
                       <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest leading-none mt-1">Ready for upload</p>
                   </div>
                </div>
                <button 
                  onClick={() => setAttachment(null)} 
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-200/50 text-blue-700 transition-colors shadow-sm"
                >
                    <XCircle size={20} />
                </button>
              </div>
            )}
            
            <form onSubmit={handleMessageSubmit} className="flex items-end gap-3 max-w-6xl mx-auto">
              {/* Attach Button */}
              <label className={`
                flex-shrink-0 w-14 h-14 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all duration-300 active:scale-95
                ${attachment 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20' 
                  : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-blue-500 hover:text-blue-600 hover:bg-white shadow-sm'
                }
              `}>
                <input type="file" className="hidden" onChange={(e) => setAttachment(e.target.files[0])} />
                <Paperclip size={22} className={attachment ? 'rotate-45 transition-transform duration-500' : ''} />
              </label>
              
              {/* Textarea */}
              <div className="flex-1 relative group">
                <textarea 
                  rows="1"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleMessageSubmit();
                      }
                  }}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-[15px] font-medium placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all max-h-40 resize-none shadow-sm group-hover:bg-slate-100/50"
                  placeholder="Type your message here..."
                />
              </div>
              
              {/* Send Button */}
              <button 
                type="submit"
                disabled={sendingMsg || (!newMessage.trim() && !attachment)}
                className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all duration-300 shadow-xl shadow-blue-600/25 active:scale-90 disabled:opacity-50 disabled:shadow-none"
              >
                {sendingMsg ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} className="ml-0.5" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
