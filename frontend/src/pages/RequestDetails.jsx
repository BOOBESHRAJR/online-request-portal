import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Paperclip, Send, File, Download, 
  Loader2, MessageCircle, CheckCircle2, XCircle, Clock, 
  ArrowLeft, User, Calendar, ShieldCheck, FileText, Eye,
  Activity, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const RequestDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
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
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
      <p className="text-slate-500 font-medium">Loading details...</p>
    </div>
  );

  return (
    <div className="max-w-[1500px] mx-auto h-[calc(100vh-6rem)] flex flex-col animate-in fade-in duration-500 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-2 mb-4 shrink-0">
        <Link to={user?.role === 'admin' ? "/admin" : "/dashboard"} className="group flex items-center gap-3 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200 group-hover:border-indigo-200 transition-colors">
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> 
          </div>
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Live Connection</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
        
        {/* LEFT SIDEBAR: Details */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
          <div className="p-6 bg-slate-50/80 border-b border-slate-100 shrink-0">
             <div className="flex justify-between items-start mb-4">
                 <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-100">
                   {request.category}
                 </div>
                 <span className="text-[11px] font-bold text-slate-400 font-mono tracking-wider">#{request._id.slice(-6).toUpperCase()}</span>
             </div>
             <h2 className="text-2xl font-extrabold text-slate-900 leading-tight mb-4">
               {request.title}
             </h2>
             <div className="flex items-center gap-5 text-xs font-bold text-slate-500">
               <div className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> {new Date(request.createdAt).toLocaleDateString()}</div>
               <div className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {new Date(request.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              {/* Status */}
              <div className="space-y-3">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Activity size={14} /> Current Status
                  </h3>
                  <motion.div 
                      key={request.status}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
                          request.status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                          request.status === 'rejected' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                          'bg-amber-50 border-amber-100 text-amber-800'
                      }`}
                  >
                      <div className="flex items-center gap-4">
                          <div className="bg-white p-2.5 rounded-xl shadow-sm">
                              {request.status === 'approved' ? <CheckCircle2 size={24} className="text-emerald-600" /> : 
                               request.status === 'rejected' ? <XCircle size={24} className="text-rose-600" /> : 
                               <Clock size={24} className="text-amber-600" />}
                          </div>
                          <div>
                              <p className="text-sm font-black uppercase tracking-wider">{request.status}</p>
                              <p className="text-[10px] font-bold opacity-60">Status synced automatically</p>
                          </div>
                      </div>
                  </motion.div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Info size={14} /> Request Narrative
                  </h3>
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-[14px] font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {request.description}
                  </div>
              </div>

              {/* Requester */}
              <div className="space-y-3">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <User size={14} /> Submitted By
                  </h3>
                  <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-indigo-100 transition-colors">
                      <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[14px] flex items-center justify-center font-bold text-lg shadow-inner">
                          {request.user?.name?.charAt(0)}
                      </div>
                      <div>
                          <p className="font-extrabold text-slate-900 leading-tight">{request.user?.name}</p>
                          <p className="text-xs font-semibold text-slate-500">{request.user?.email}</p>
                      </div>
                  </div>
              </div>

              {/* Attachments */}
              {request.documents?.length > 0 && (
              <div className="space-y-3">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Paperclip size={14} /> Attached Documents
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                      {request.documents.map((doc, i) => {
                          const hasLegacyPath = !!doc.path;
                          const docUrl = hasLegacyPath 
                            ? (doc.path.startsWith('http') ? doc.path : `/${doc.path}`)
                            : `${import.meta.env.VITE_API_URL || '/api'}/requests/${request._id}/document/${doc._id}?token=${user.token}`;
                          
                          const docType = doc.contentType || doc.mimetype;
                          const isImage = docType ? docType.startsWith('image/') : /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.filename);
                          
                          return (
                              <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all group">
                                  <div className="flex items-center gap-4 overflow-hidden">
                                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                                          {isImage ? <img src={docUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/> : <FileText size={20} className="text-slate-400" />}
                                      </div>
                                      <div className="overflow-hidden">
                                          <p className="text-sm font-bold text-slate-800 truncate leading-tight mb-1">{doc.filename}</p>
                                          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">{isImage ? 'Image Asset' : 'Document'}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                      <a href={docUrl} target="_blank" className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-colors shadow-sm"><Eye size={14}/></a>
                                      <a href={docUrl} download className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-colors shadow-sm"><Download size={14}/></a>
                                  </div>
                              </div>
                          )
                      })}
                  </div>
              </div>
              )}

              {/* Admin section */}
              {user?.role === 'admin' && (
                  <div className="space-y-4 pt-6 mt-4 border-t-2 border-dashed border-slate-200">
                      <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                          <ShieldCheck size={14} /> Admin Controls
                      </h3>
                      <div className="space-y-4 p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                          <textarea
                              value={adminReply}
                              onChange={e => setAdminReply(e.target.value)}
                              placeholder="Add secure admin note or resolution details..."
                              rows="3"
                              className="w-full p-4 rounded-xl bg-white border border-indigo-100 shadow-sm text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none resize-none transition-all"
                          />
                          <div className="grid grid-cols-2 gap-3">
                              <button
                                  onClick={() => updateStatus('approved')} disabled={statusLoading}
                                  className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                              >
                                  {statusLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />} Approve
                              </button>
                              <button
                                  onClick={() => updateStatus('rejected')} disabled={statusLoading}
                                  className="py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                              >
                                  {statusLoading ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={18} />} Reject
                              </button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
        </div>

        {/* RIGHT SIDEBAR: Chat */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
           {/* Chat header */}
           <div className="px-6 py-4 bg-white border-b border-slate-100 shrink-0 flex items-center gap-4 relative z-10 shadow-[0_4px_20px_-15px_rgba(0,0,0,0.1)]">
              <div className="w-11 h-11 rounded-[14px] bg-gradient-to-b from-indigo-50 to-white border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                  <MessageCircle size={22} className="fill-indigo-100/50" />
              </div>
              <div>
                  <h2 className="font-extrabold text-slate-900 text-lg leading-tight mb-0.5">Support Chat</h2>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Agents typically reply in minutes</p>
              </div>
           </div>

           {/* Messages */}
           <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]/50 custom-scrollbar flex flex-col gap-6 relative">
              {/* Background watermark icon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
                <MessageCircle size={240} />
              </div>

              {messages.length === 0 ? (
                  <div className="m-auto text-center max-w-sm relative z-10">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50 border border-slate-100 animate-in zoom-in duration-500">
                          <MessageCircle size={32} className="text-indigo-400" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Need assistance?</h3>
                      <p className="text-sm font-medium text-slate-500 leading-relaxed">Send a message below to start the conversation with our support team or attach files if you need to provide additional context.</p>
                  </div>
              ) : (
                  messages.map((msg, index) => {
                      const isMe = msg.sender._id === user?._id;
                      const msgTime = new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                      
                      return (
                          <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 relative z-10`}>
                              <div className={`flex items-center gap-2 mb-1.5 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                  <span className="text-[11px] font-extrabold text-slate-600">{isMe ? 'You' : msg.sender.name}</span>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{msgTime}</span>
                              </div>
                              <div className={`relative max-w-[85%] md:max-w-[70%] group flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                  <div className={`p-4 shadow-sm ${
                                      isMe ? 'bg-indigo-600 text-white rounded-[1.5rem] rounded-tr-md' : 'bg-white border border-slate-200/60 text-slate-800 rounded-[1.5rem] rounded-tl-md shadow-slate-200/50'
                                  }`}>
                                      {msg.message && <p className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap">{msg.message}</p>}
                                      {msg.attachment && (() => {
                                          const hasLegacyMsgPath = !!msg.attachment.path;
                                          const msgAttachUrl = hasLegacyMsgPath 
                                              ? (msg.attachment.path.startsWith('http') ? msg.attachment.path : `/${msg.attachment.path}`)
                                              : `${import.meta.env.VITE_API_URL || '/api'}/messages/attachment/${msg._id}?token=${user.token}`;
                                              
                                          const msgAttachType = msg.attachment.contentType || msg.attachment.mimetype;
                                          const msgIsImage = msgAttachType ? msgAttachType.startsWith('image/') : /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.attachment.filename);

                                          return (
                                              <div className={`mt-3 ${msg.message ? (isMe ? 'border-t border-indigo-400/30 pt-3' : 'border-t border-slate-100 pt-3') : ''}`}>
                                                  {msgIsImage ? (
                                                      <div className="rounded-xl overflow-hidden shadow-sm hover:opacity-90 transition-opacity border border-black/5 bg-black/5">
                                                          <img onClick={() => window.open(msgAttachUrl, '_blank')} src={msgAttachUrl} alt="attachment" className="max-h-60 w-auto object-cover cursor-pointer" />
                                                      </div>
                                                  ) : (
                                                      <a href={msgAttachUrl} target="_blank" className={`flex items-center gap-3 p-3 rounded-xl border transition-all shadow-sm ${isMe ? 'bg-indigo-700/50 border-indigo-500 hover:bg-indigo-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                                                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isMe ? 'bg-white/20' : 'bg-white border border-slate-200 shadow-sm'}`}>
                                                              <File size={20} className={isMe ? 'text-white' : 'text-slate-500'} />
                                                          </div>
                                                          <div className="overflow-hidden min-w-[120px]">
                                                              <p className={`text-sm font-bold truncate ${isMe ? 'text-white' : 'text-slate-800'}`}>{msg.attachment.filename}</p>
                                                              <p className={`text-[10px] uppercase font-bold tracking-widest mt-0.5 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>Document attached</p>
                                                          </div>
                                                          <Download size={16} className={`shrink-0 ${isMe ? 'opacity-50 text-white' : 'text-slate-400'}`} />
                                                      </a>
                                                  )}
                                              </div>
                                          )
                                      })()}
                                  </div>
                              </div>
                          </div>
                      )
                  })
              )}
              <div ref={messagesEndRef} />
           </div>

           {/* Input Area */}
           <div className="p-4 bg-white border-t border-slate-100 shrink-0 relative z-10 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.05)]">
              {attachment && (
                  <div className="mb-4 inline-flex items-center gap-3 bg-indigo-50 border border-indigo-100 pl-4 pr-2 py-2 rounded-xl animate-in slide-in-from-bottom-2 duration-300">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        <Paperclip size={14} className="text-indigo-500"/>
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-slate-800 truncate max-w-[200px] leading-tight">{attachment.name}</span>
                        <span className="block text-[9px] uppercase font-black text-indigo-400 tracking-widest mt-0.5">Attached</span>
                      </div>
                      <button onClick={() => setAttachment(null)} className="ml-2 w-8 h-8 flex items-center justify-center hover:bg-indigo-100 rounded-lg text-indigo-500 transition-colors"><XCircle size={18}/></button>
                  </div>
              )}
              <form onSubmit={handleMessageSubmit} className="flex items-end gap-3 max-w-5xl mx-auto">
                  <label className={`shrink-0 w-12 h-12 rounded-[14px] flex items-center justify-center cursor-pointer transition-all border shadow-sm ${
                      attachment ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-500 hover:border-indigo-200 hover:bg-slate-50'
                  }`}>
                      <input type="file" className="hidden" onChange={e => setAttachment(e.target.files[0])} />
                      <Paperclip size={20} className={attachment ? 'rotate-45 transition-transform' : ''} />
                  </label>
                  <textarea 
                      rows="1"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => {
                          if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleMessageSubmit(); }
                      }}
                      placeholder="Type your message here..."
                      className="flex-1 bg-slate-50 resize-none rounded-[14px] px-5 py-3.5 text-[15px] outline-none max-h-32 text-slate-800 font-medium placeholder:font-medium placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 border border-slate-200 focus:border-indigo-300 transition-all shadow-sm"
                  />
                  <button 
                      type="submit"
                      disabled={sendingMsg || (!newMessage.trim() && !attachment)}
                      className="shrink-0 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[14px] flex items-center justify-center disabled:opacity-50 disabled:shadow-none transition-all shadow-lg shadow-indigo-500/25 active:scale-90"
                  >
                      {sendingMsg ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-1" />}
                  </button>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
