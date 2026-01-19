'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Client usage for Auth methods
import { updateProfile, getUserProfile } from '@/app/actions/user';
import { User, Settings, Shield, LogOut, Trash2, Camera, Loader2, Save, UserCircle } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({ full_name: '', avatar_url: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const profile = await getUserProfile();
        if (profile) {
            setUser(profile);
            setFormData({ 
                full_name: profile.full_name || '', 
                avatar_url: profile.avatar_url || '' 
            });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
        await updateProfile(formData);
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        router.refresh(); // Refresh server components
    } catch (err) {
        setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
        setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return (
      <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
      </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <h1 className="text-2xl font-bold mb-8 text-gray-900">Settings</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-2">
            <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3
                    ${activeTab === 'profile' 
                        ? 'bg-forest text-white shadow-lg shadow-forest/20' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
            >
                <UserCircle className="w-5 h-5" /> Profile
            </button>
            <button 
                onClick={() => setActiveTab('account')}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3
                    ${activeTab === 'account' 
                        ? 'bg-forest text-white shadow-lg shadow-forest/20' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
            >
                <Shield className="w-5 h-5" /> Account & Security
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow">
            {activeTab === 'profile' && (
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-forest" /> Personal Information
                    </h2>
                    
                    <div className="mb-8 flex flex-col items-center sm:items-start gap-4">
                        <div className="relative group cursor-pointer">
                            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                {formData.avatar_url ? (
                                    <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-bold text-gray-400">
                                        {(formData.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                <Camera className="w-8 h-8" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">
                            Click to upload new avatar (Coming Soon)
                        </p>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-500">Email Address</label>
                            <input 
                                type="email" 
                                value={user?.email || ''} 
                                disabled 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-500">Full Name</label>
                            <input 
                                type="text" 
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition"
                                placeholder="Enter your name"
                            />
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="btn btn-primary min-w-[140px] flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'account' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-forest" /> Security
                        </h2>
                        <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm mb-6">
                            To change your password, please use the "Forgot Password" link on the login page or contact support.
                        </div>
                        <button 
                            onClick={handleSignOut}
                            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 w-full md:w-auto flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out from All Devices
                        </button>
                    </div>

                    <div className="bg-red-50 p-6 md:p-8 rounded-2xl border border-red-100">
                        <h2 className="text-lg font-bold mb-4 text-red-700 flex items-center gap-2">
                            <Trash2 className="w-5 h-5" /> Danger Zone
                        </h2>
                        <p className="text-sm text-red-600 mb-6">
                            Deleting your account is permanent. All your flashcards, progress, and exam history will be wiped immediately.
                        </p>
                        <button 
                            disabled
                            className="px-4 py-2 border border-red-200 text-red-400 bg-white rounded-lg text-sm cursor-not-allowed font-medium"
                            title="Contact support to delete account"
                        >
                            Delete Account (Contact Support)
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
