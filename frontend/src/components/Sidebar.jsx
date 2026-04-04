import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, PlusCircle, List, 
  ShieldAlert, Settings, HelpCircle, 
  X, ShieldCheck, LogOut
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { 
      label: 'Dashboard', 
      path: user?.role === 'admin' ? '/admin' : '/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      label: 'Create Request', 
      path: '/create-request', 
      icon: PlusCircle,
      role: 'user'
    },
    { 
      label: 'Admin Panel', 
      path: '/admin', 
      icon: ShieldAlert,
      role: 'admin'
    }
  ];

  const filteredItems = menuItems.filter(item => !item.role || item.role === user?.role);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 w-64 bg-slate-900 text-slate-300 z-50 
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          
          {/* Logo Section */}
          <div className="flex items-center justify-between p-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white shadow-lg">
                <ShieldCheck size={20} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Portal</span>
            </Link>
            <button 
              onClick={toggleSidebar}
              className="p-1 lg:hidden text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {filteredItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-semibold
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-blue-900/20' 
                      : 'hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Utility Sections */}
          <div className="p-4 border-t border-slate-800 space-y-1">
            <NavLink 
              to="/settings"
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-semibold
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-blue-900/20' 
                  : 'hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <Settings size={18} />
              <span>Settings</span>
            </NavLink>
            <NavLink 
              to="/support"
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-semibold
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-blue-900/20' 
                  : 'hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <HelpCircle size={18} />
              <span>Support</span>
            </NavLink>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all text-left"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
