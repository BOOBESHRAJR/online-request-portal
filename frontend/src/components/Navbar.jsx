import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, Bell, CheckCircle2, Menu, X, 
  Search, User, Settings, Clock, ChevronDown, 
  Inbox, Loader2, MessageCircle, FileText
} from 'lucide-react';
import api from '../services/api';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark read');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-0 z-40 lg:pl-64 transition-all">
      <div className="h-full px-6 flex items-center justify-between">
        
        {/* Left: Mobile Menu & Global Search */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="p-2 -ml-2 text-slate-400 hover:bg-slate-100 rounded-lg lg:hidden transition-all"
          >
            <Menu size={20} />
          </button>
          
          <div className="hidden md:flex items-center bg-slate-100 border border-transparent rounded-lg px-3 py-1.5 gap-2 w-64 group focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 text-slate-700 font-medium"
            />
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-3">
          
          {/* Notifications System */}
          <div className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all relative group ${isNotifOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200'}`}
            >
              <Bell size={20} className={isNotifOpen ? 'animate-none' : 'group-hover:animate-bounce'} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-sm animate-in zoom-in duration-300">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)} />
                <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-20 animate-in fade-in slide-in-from-top-4 duration-300">
                  
                  {/* Dropdown Header */}
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                     <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[9px] font-black uppercase rounded">New</span>
                        )}
                     </div>
                     {unreadCount > 0 && (
                       <button onClick={async () => {
                           try {
                             await api.put('/notifications/mark-all-read');
                             setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                           } catch (error) {
                             console.error("Failed to mark all read");
                           }
                         }} 
                         className="text-[10px] text-blue-600 font-bold uppercase hover:text-blue-700 transition-colors flex items-center gap-1.5">
                         <CheckCircle2 size={12} /> Mark all read
                       </button>
                     )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-20 text-center animate-in fade-in duration-500">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                            <Inbox className="text-slate-200" size={36} />
                        </div>
                        <h4 className="text-slate-900 font-extrabold text-lg tracking-tight mb-1">Clear for now!</h4>
                        <p className="text-xs font-medium text-slate-400 px-12 leading-relaxed">Check back later for updates on your requests and support tickets.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {notifications.map(notif => {
                          const isNew = !notif.isRead;
                          const isMessage = notif.message.toLowerCase().includes('message');
                          
                          return (
                            <div 
                              key={notif._id} 
                              onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                              className={`p-4 flex gap-4 cursor-pointer transition-all hover:bg-slate-50 relative group ${isNew ? 'bg-blue-50/40' : 'bg-white'}`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${isNew ? 'bg-white border-blue-100 text-blue-600 shadow-sm' : 'bg-slate-50 border-transparent text-slate-400 grayscale'}`}>
                                {isMessage ? <MessageCircle size={18} /> : <FileText size={18} />}
                              </div>
                              
                              <div className="flex-1 min-w-0 pr-4">
                                <p className={`text-[13px] leading-snug mb-1.5 line-clamp-2 ${isNew ? 'font-bold text-slate-900' : 'font-medium text-slate-500'}`}>
                                  {notif.message}
                                </p>
                                <div className="flex items-center gap-3">
                                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <Clock size={10} /> {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                                  </span>
                                  {isNew && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                                  )}
                                </div>
                              </div>

                              {/* Invisible action button appears on hover */}
                              {!notif.isRead && (
                                <button className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 bg-white border border-slate-200 rounded-lg text-blue-600 shadow-sm hover:scale-110 transition-all">
                                   <CheckCircle2 size={14} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-100 text-center">
                        <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                            View All History
                        </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-all group"
            >
              <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                {user?.name?.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[13px] font-bold text-slate-900 leading-none mb-0.5">{user?.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user?.role}</p>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-20 p-1 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-3 mb-1 border-b border-slate-100">
                     <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                     <p className="text-xs font-semibold text-slate-400 truncate">{user?.email}</p>
                  </div>

                  <div className="space-y-0.5" onClick={() => setIsProfileOpen(false)}>
                     <Link 
                       to="/settings"
                       className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all text-xs font-bold"
                     >
                        <User size={16} /> My Account
                     </Link>
                     <Link 
                       to="/settings"
                       className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all text-xs font-bold"
                     >
                        <Settings size={16} /> Settings
                     </Link>
                     <div className="h-px bg-slate-100 my-1"></div>
                     <button 
                       onClick={handleLogout}
                       className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all text-xs font-bold"
                     >
                       <LogOut size={16} /> Logout
                     </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
