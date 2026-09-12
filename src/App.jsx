import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { getSettings } from './services/firestore';
import LoginPanel from './panels/LoginPanel';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Master Panel
import MasterDashboard from './panels/MasterPanel/MasterDashboard';
import ManageAdmins from './panels/MasterPanel/ManageAdmins';
import ManageDistricts from './panels/MasterPanel/ManageDistricts';
import ManageWorkersMaster from './panels/MasterPanel/ManageWorkers';
import ViewClients from './panels/MasterPanel/ViewClients';
import ViewComplaints from './panels/MasterPanel/ViewComplaints';
import HonorScores from './panels/MasterPanel/HonorScores';
import SiteSettings from './panels/MasterPanel/SiteSettings';

// Admin Panel
import AdminDashboard from './panels/AdminPanel/AdminDashboard';
import ComplaintsList from './panels/AdminPanel/ComplaintsList';
import AdminManageWorkers from './panels/AdminPanel/ManageWorkers';

// Worker Panel
import WorkerDashboard from './panels/WorkerPanel/WorkerDashboard';
import AssignedTasks from './panels/WorkerPanel/AssignedTasks';

// Client Panel
import ClientDashboard from './panels/ClientPanel/ClientDashboard';
import NewComplaint from './panels/ClientPanel/NewComplaint';
import MyComplaints from './panels/ClientPanel/MyComplaints';
import Leaderboard from './panels/ClientPanel/Leaderboard';

const SIDEBAR_MENUS = {
  master: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'admins', label: 'Manage Admins', icon: 'admins' },
    { id: 'districts', label: 'Manage Districts', icon: 'districts' },
    { id: 'workers', label: 'Manage Workers', icon: 'workers' },
    { id: 'clients', label: 'View Clients', icon: 'clients' },
    { id: 'complaints', label: 'View Complaints', icon: 'complaints' },
    { id: 'leaderboard', label: 'Honor Scores', icon: 'leaderboard' },
    { id: 'settings', label: 'Site Settings', icon: 'settings' }
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'complaints', label: 'Complaints', icon: 'complaints' },
    { id: 'workers', label: 'My Workers', icon: 'workers' }
  ],
  worker: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'tasks', label: 'Assigned Tasks', icon: 'tasks' }
  ],
  client: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'newComplaint', label: 'File Complaint', icon: 'newComplaint' },
    { id: 'myComplaints', label: 'My Complaints', icon: 'complaints' },
    { id: 'leaderboard', label: 'Leaderboard', icon: 'leaderboard' }
  ]
};

function AppContent() {
  const { isAuthenticated, loading, role, userData } = useAuth();
  const [activePanel, setActivePanel] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [siteTitle, setSiteTitle] = useState('UP Municipal Civic Desk');
  const [siteLogo, setSiteLogo] = useState('');

  useEffect(() => {
    getSettings().then(s => {
      if (s) {
        setSiteTitle(s.siteTitle || 'UP Municipal Civic Desk');
        setSiteLogo(s.siteLogo || '');
      }
    });
  }, []);

  useEffect(() => {
    setActivePanel('dashboard');
  }, [role]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading UP-MCD...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPanel />;
  }

  const menuItems = SIDEBAR_MENUS[role] || SIDEBAR_MENUS.client;

  const renderPanel = () => {
    if (role === 'master') {
      switch (activePanel) {
        case 'dashboard': return <MasterDashboard onNavigate={setActivePanel} />;
        case 'admins': return <ManageAdmins />;
        case 'districts': return <ManageDistricts />;
        case 'workers': return <ManageWorkersMaster />;
        case 'clients': return <ViewClients />;
        case 'complaints': return <ViewComplaints />;
        case 'leaderboard': return <HonorScores />;
        case 'settings': return <SiteSettings />;
        default: return <MasterDashboard onNavigate={setActivePanel} />;
      }
    }
    if (role === 'admin') {
      switch (activePanel) {
        case 'dashboard': return <AdminDashboard onNavigate={setActivePanel} />;
        case 'complaints': return <ComplaintsList />;
        case 'workers': return <AdminManageWorkers />;
        default: return <AdminDashboard onNavigate={setActivePanel} />;
      }
    }
    if (role === 'worker') {
      switch (activePanel) {
        case 'dashboard': return <WorkerDashboard />;
        case 'tasks': return <AssignedTasks />;
        default: return <WorkerDashboard />;
      }
    }
    // Client
    switch (activePanel) {
      case 'dashboard': return <ClientDashboard onNavigate={setActivePanel} />;
      case 'newComplaint': return <NewComplaint onBack={() => setActivePanel('dashboard')} />;
      case 'myComplaints': return <MyComplaints />;
      case 'leaderboard': return <Leaderboard />;
      default: return <ClientDashboard onNavigate={setActivePanel} />;
    }
  };

  return (
    <div className="app-layout">
      <Navbar
        siteTitle={siteTitle}
        siteLogo={siteLogo}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="app-layout__body">
        <Sidebar
          items={menuItems}
          activeItem={activePanel}
          onItemClick={setActivePanel}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="app-layout__main">
          {renderPanel()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
