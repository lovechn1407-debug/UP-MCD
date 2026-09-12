import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ProfileModal } from './components/ProfileModal';
import { Leaderboard } from './components/Leaderboard';
import { LoginPanel } from './panels/LoginPanel';
import { MasterPanel } from './panels/MasterPanel';
import { AdminPanel } from './panels/AdminPanel';
import { WorkerPanel } from './panels/WorkerPanel';
import { ClientPanel } from './panels/ClientPanel';
import { ShieldCheck, Building2, Heart } from 'lucide-react';

const MainContent = () => {
  const { currentUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfileModal, setShowProfileModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wider text-slate-300">Loading UP Municipal Portal...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPanel />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Header Navigation */}
      <Navbar
        onOpenProfile={() => setShowProfileModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'leaderboard' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Leaderboard />
          </div>
        ) : (
          <>
            {currentUser.role === 'master' && <MasterPanel />}
            {currentUser.role === 'admin' && <AdminPanel />}
            {currentUser.role === 'worker' && <WorkerPanel />}
            {currentUser.role === 'client' && <ClientPanel />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-extrabold text-slate-200">Department of Appointment & Personnel, Govt. of Uttar Pradesh</p>
              <p className="text-[11px] text-slate-400">Swachh Bharat Mission • Jan Seva Municipal Redressal Cell</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Official Portal Standard V2.5
            </span>
            <span>Helpline: 1800-180-0001</span>
          </div>
        </div>
      </footer>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
