import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Save, Shield, UserCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profile.name.trim() || !profile.phoneNumber.trim()) {
        return toast.error('Please fill all required fields');
    }

    setLoading(true);
    try {
      await updateUser({
        name: profile.name,
        phoneNumber: profile.phoneNumber
      });
      toast.success('Profile details updated successfully.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.newPassword) {
        return toast.error('Please enter a new password');
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match');
    }

    setLoading(true);
    try {
      await updateUser({
        password: passwordData.newPassword
      });
      toast.success('Password changed successfully.');
      setPasswordData({ newPassword: '', confirmPassword: ''});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="mb-10 space-y-2 text-center">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 font-medium">Manage your personal information and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Tabs */}
        <div className="space-y-2">
            <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'profile' ? 'bg-white border border-blue-100 text-blue-600 shadow-sm shadow-blue-500/10' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}
            >
                <UserCircle size={20} /> My Profile
            </button>
            <button 
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'security' ? 'bg-white border border-blue-100 text-blue-600 shadow-sm shadow-blue-500/10' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}
            >
                <Shield size={20} /> Password & Security
            </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-8">
            {activeTab === 'profile' ? (
                /* Profile Section */
                <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    <div className="p-8 sm:p-10">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <User className="text-blue-600" size={24} /> General Profile
                            </h2>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-100 flex items-center gap-1">
                                <CheckCircle2 size={12} /> Live Sync
                            </span>
                        </div>
                        
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            type="text" 
                                            autoComplete="name"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700 text-[15px]"
                                            value={profile.name}
                                            onChange={(e) => setProfile({...profile, name: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            type="tel" 
                                            autoComplete="tel"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700 text-[15px]"
                                            value={profile.phoneNumber}
                                            onChange={(e) => setProfile({...profile, phoneNumber: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="email" 
                                        readOnly
                                        className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg font-medium text-slate-500 cursor-not-allowed text-[15px]"
                                        value={profile.email}
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium ml-1">Email address is used for authentication and cannot be modified.</p>
                            </div>

                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white py-3.5 px-10 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                >
                                    <Save size={18} /> Update Details
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            ) : (
                /* Password Section */
                <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    <div className="p-8 sm:p-10">
                        <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                            <KeyRound className="text-blue-600" size={24} /> Security Credentials
                        </h2>
                        
                        <form onSubmit={handlePasswordSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">New Secure Password</label>
                                    <div className="relative group">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="password" 
                                            autoComplete="new-password"
                                            placeholder="••••••••"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700 text-[15px]"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</label>
                                    <div className="relative group">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="password" 
                                            autoComplete="new-password"
                                            placeholder="••••••••"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700 text-[15px]"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="flex gap-3">
                                    <Shield size={20} className="text-blue-600 shrink-0" />
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        Changing your password will immediately update your global credentials. Make sure to use a strong, unique password for better security.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-8 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                >
                                    <Shield size={18} /> Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
