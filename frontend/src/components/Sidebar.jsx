import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, PlusCircle, List, 
  Users, BarChart3, Settings, HelpCircle, 
  X, ShieldCheck, LogOut, ChevronRight,
  ShieldAlert, Database, PieChart
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  const adminSections = [
    {
      title: 'System',
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'All Requests', path: '/admin/requests', icon: List },
        { label: 'Manage Users', path: '/admin/users', icon: Users },
      ]
    },
    {
      title: 'Analysis',
      items: [
        { label: 'Analytics', path: '/admin/analytics', icon: PieChart },
        { label: 'System Control', path: '/admin/system', icon: Database },
      ]
    },
    {
      title: 'Account',
      items: [
        { label: 'Settings', path: '/settings', icon: Settings },
        { label: 'Logout', action: logout, icon: LogOut, isAction: true }
      ]
    }
  ];

  const userSections = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Management',
      items: [
        { label: 'Create Request', path: '/create-request', icon: PlusCircle }
      ]
    },
    {
      title: 'Support',
      items: [
        { label: 'Help Center', path: '/support', icon: HelpCircle }
      ]
    },
    {
      title: 'Account',
      items: [
        { label: 'Settings', path: '/settings', icon: Settings },
        { label: 'Logout', action: logout, icon: LogOut, isAction: true }
      ]
    }
  ];

  const sections = isAdmin ? adminSections : userSections;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 w-64 z-50 
        transition-all duration-300 ease-in-out lg:translate-x-0
        flex flex-col
        ${isAdmin ? 'bg-[#0a0f1e] border-r border-[#1e293b]' : 'bg-[#0f172a] border-r border-slate-800/50'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Section */}
        <div className="p-6 mb-2">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3.5 group">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-105 ${isAdmin ? 'bg-gradient-to-br from-slate-600 to-slate-800' : 'bg-gradient-to-br from-indigo-500 to-blue-600 shadow-blue-500/20'}`}>
                {isAdmin ? <ShieldAlert size={22} strokeWidth={2.5} /> : <ShieldCheck size={22} strokeWidth={2.5} />}
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-white tracking-tight leading-none">{isAdmin ? 'ADMIN' : 'PORTAL'}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">{isAdmin ? 'Oversight' : 'Management'}</span>
              </div>
            </Link>
            <button onClick={toggleSidebar} className="p-2 lg:hidden text-slate-500 hover:text-white rounded-lg transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 scrollbar-hide">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className={`px-4 text-[10px] font-black uppercase tracking-[0.15em] ${isAdmin ? 'text-slate-500' : 'text-slate-600'}`}>
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, i) => {
                  const isActive = !item.isAction && location.pathname === item.path;
                  const Icon = item.icon;

                  if (item.isAction) {
                    return (
                      <button
                        key={i}
                        onClick={item.action}
                        className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-bold group ${isAdmin ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/5' : 'text-rose-400 hover:bg-rose-500/10'}`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </button>
                    );
                  }

                  if (isAdmin) {
                    // Admin Minimal Design
                    return (
                      <NavLink
                        key={i}
                        to={item.path}
                        onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                        className={`
                          relative flex items-center gap-3.5 px-4 py-2.5 transition-all duration-300 text-sm font-bold group
                          ${isActive 
                            ? 'text-white' 
                            : 'text-slate-500 hover:text-slate-300'
                          }
                        `}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                        )}
                        <Icon size={18} className={`${isActive ? 'text-blue-500' : 'text-slate-600 group-hover:text-slate-400'}`} />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  }

                  // Classic User Button Design
                  return (
                    <NavLink
                      key={i}
                      to={item.path}
                      onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                      className={`
                        flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 text-sm font-bold group
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20' 
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3.5">
                        <Icon size={18} className={`transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <div className="w-1 h-1 bg-white rounded-full"></div>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Info Section */}
        <div className={`p-4 border-t transition-colors ${isAdmin ? 'border-[#1e293b] bg-slate-900/20' : 'border-slate-800/50 bg-slate-900/30'}`}>
          <div className="flex items-center gap-3 px-3 py-2">
             <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-black shadow-inner ${isAdmin ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-800 border-slate-700 text-blue-400'}`}>
                {user?.name?.charAt(0).toUpperCase()}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter truncate">{user?.role}</p>
             </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
