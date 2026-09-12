import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  INITIAL_SITE_SETTINGS, 
  INITIAL_DISTRICTS, 
  INITIAL_WORKERS, 
  INITIAL_COMPLAINTS,
  INITIAL_CHATS 
} from '../services/seedData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Site Settings
  const [siteSettings, setSiteSettings] = useState(() => {
    const saved = localStorage.getItem('up_mcd_site_settings');
    return saved ? JSON.parse(saved) : INITIAL_SITE_SETTINGS;
  });

  // Districts
  const [districts, setDistricts] = useState(() => {
    const saved = localStorage.getItem('up_mcd_districts');
    return saved ? JSON.parse(saved) : INITIAL_DISTRICTS;
  });

  // Workers
  const [workers, setWorkers] = useState(() => {
    const saved = localStorage.getItem('up_mcd_workers');
    return saved ? JSON.parse(saved) : INITIAL_WORKERS;
  });

  // Complaints
  const [complaints, setComplaints] = useState(() => {
    const saved = localStorage.getItem('up_mcd_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  // Chats
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('up_mcd_chats');
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });

  // Persist State Updates
  useEffect(() => {
    localStorage.setItem('up_mcd_site_settings', JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    localStorage.setItem('up_mcd_districts', JSON.stringify(districts));
  }, [districts]);

  useEffect(() => {
    localStorage.setItem('up_mcd_workers', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('up_mcd_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('up_mcd_chats', JSON.stringify(chats));
  }, [chats]);

  // Automatic 5-Day Auto-Resolve Scanner
  useEffect(() => {
    const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
    const interval = setInterval(() => {
      const now = Date.now();
      let changed = false;

      const updated = complaints.map(cmp => {
        if (cmp.status === 'Worker Finalised' && cmp.workerFinalisedAt) {
          const finalizedTime = new Date(cmp.workerFinalisedAt).getTime();
          if (now - finalizedTime >= FIVE_DAYS_MS) {
            changed = true;
            return {
              ...cmp,
              status: 'Resolved',
              resolvedAt: new Date().toISOString(),
              autoResolved: true,
              workerRemark: cmp.workerRemark + " (Auto-Resolved after 5 days of worker completion)"
            };
          }
        }
        return cmp;
      });

      if (changed) {
        setComplaints(updated);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [complaints]);

  // Site Settings Handlers (Master Panel)
  const updateSiteSettings = (newSettings) => {
    setSiteSettings(prev => ({ ...prev, ...newSettings }));
  };

  // District Handlers (Master Panel)
  const addDistrict = (districtData) => {
    const newDistrict = {
      id: `dist_${Date.now()}`,
      ...districtData
    };
    setDistricts(prev => [newDistrict, ...prev]);
    return newDistrict;
  };

  // Worker Handlers (Master & Admin Panel)
  const addWorker = (workerData) => {
    const newWorker = {
      id: `wrk_${Date.now()}`,
      ...workerData,
      email: `${workerData.workerId}@up-mcd.gov.in`
    };
    setWorkers(prev => [newWorker, ...prev]);
    return newWorker;
  };

  // Complaint Handlers
  const createComplaint = (complaintData) => {
    const newComplaint = {
      id: `CMP-UP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      status: "Pending Admin",
      createdAt: new Date().toISOString(),
      expectedTimeDays: null,
      expectedDate: null,
      workerId: "",
      workerName: "",
      workerPhone: "",
      adminReply: "",
      workerRemark: "",
      workerPhotos: [],
      workerFinalisedAt: null,
      rejectionReason: "",
      rejectionPhoto: "",
      resolvedAt: null,
      ...complaintData
    };
    setComplaints(prev => [newComplaint, ...prev]);
    return newComplaint;
  };

  // Admin Reply & Worker Assignment (Admin Panel)
  const adminRespondAndAssign = (complaintId, expectedDays, adminReplyText, workerId) => {
    const maxDays = Math.min(parseInt(expectedDays, 10) || 7, 20); // Not more than 20 days!
    const targetDate = new Date(Date.now() + maxDays * 24 * 60 * 60 * 1000).toISOString();
    const workerObj = workers.find(w => w.id === workerId || w.workerId === workerId);

    setComplaints(prev => prev.map(cmp => {
      if (cmp.id === complaintId) {
        return {
          ...cmp,
          status: workerObj ? "In Progress" : "Admin Replied",
          expectedTimeDays: maxDays,
          expectedDate: targetDate,
          adminReply: adminReplyText,
          workerId: workerObj ? workerObj.id : "",
          workerName: workerObj ? workerObj.name : "",
          workerPhone: workerObj ? workerObj.phone : ""
        };
      }
      return cmp;
    }));
  };

  // Worker Finalise Work (Worker Panel)
  const workerFinaliseWork = (complaintId, remark, photos) => {
    setComplaints(prev => prev.map(cmp => {
      if (cmp.id === complaintId) {
        return {
          ...cmp,
          status: "Worker Finalised",
          workerRemark: remark,
          workerPhotos: photos || [],
          workerFinalisedAt: new Date().toISOString()
        };
      }
      return cmp;
    }));
  };

  // Client Accept or Decline Resolution (Client Panel)
  const clientResolveComplaint = (complaintId) => {
    setComplaints(prev => prev.map(cmp => {
      if (cmp.id === complaintId) {
        return {
          ...cmp,
          status: "Resolved",
          resolvedAt: new Date().toISOString()
        };
      }
      return cmp;
    }));
  };

  const clientDeclineResolution = (complaintId, remark, photoUrl) => {
    setComplaints(prev => prev.map(cmp => {
      if (cmp.id === complaintId) {
        return {
          ...cmp,
          status: "Resolve Declined", // Admin & Worker see this update
          rejectionReason: remark,
          rejectionPhoto: photoUrl,
          workerFinalisedAt: null
        };
      }
      return cmp;
    }));
  };

  // Chat Handlers
  const sendMessage = (complaintId, messageObj) => {
    setChats(prev => {
      const existingIndex = prev.findIndex(c => c.complaintId === complaintId);
      const newMsg = { id: `m_${Date.now()}`, ...messageObj, timestamp: new Date().toISOString() };
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          messages: [...copy[existingIndex].messages, newMsg]
        };
        return copy;
      } else {
        return [...prev, { complaintId, messages: [newMsg] }];
      }
    });
  };

  // Leaderboard / Honor Score Calculator
  const getLeaderboardData = () => {
    return districts.map(dist => {
      const distComplaints = complaints.filter(c => c.district.toLowerCase() === dist.name.toLowerCase());
      const total = distComplaints.length;
      const resolved = distComplaints.filter(c => c.status === 'Resolved').length;
      const unfulfilled = distComplaints.filter(c => c.status !== 'Resolved').length;
      let honorScore = 100;
      if (total > 0) {
        honorScore = Math.round((resolved / total) * 100);
      }
      return {
        districtId: dist.id,
        districtName: dist.name,
        representative: dist.representative,
        phone: dist.phone,
        totalIssues: total,
        issuesResolved: resolved,
        issuesUnfulfilled: unfulfilled,
        honorScore
      };
    }).sort((a, b) => b.honorScore - a.honorScore || b.issuesResolved - a.issuesResolved);
  };

  return (
    <AppContext.Provider value={{
      siteSettings,
      updateSiteSettings,
      districts,
      addDistrict,
      workers,
      addWorker,
      complaints,
      createComplaint,
      adminRespondAndAssign,
      workerFinaliseWork,
      clientResolveComplaint,
      clientDeclineResolution,
      chats,
      sendMessage,
      getLeaderboardData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
