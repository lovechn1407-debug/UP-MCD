import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Wrench,
  Users,
  FileText,
  Trophy,
  Settings,
  PlusCircle,
  CheckSquare,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MENU_ICONS = {
  dashboard: <LayoutDashboard className="w-5 h-5" />,
  admins: <ShieldCheck className="w-5 h-5" />,
  districts: <Building2 className="w-5 h-5" />,
  workers: <Wrench className="w-5 h-5" />,
  clients: <Users className="w-5 h-5" />,
  complaints: <FileText className="w-5 h-5" />,
  leaderboard: <Trophy className="w-5 h-5" />,
  settings: <Settings className="w-5 h-5" />,
  newComplaint: <PlusCircle className="w-5 h-5" />,
  tasks: <CheckSquare className="w-5 h-5" />
};

export default function Sidebar({ items, activeItem, onItemClick, isOpen, onClose }) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Drawer */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen w-64 bg-white/95 backdrop-blur-md border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
              UP
            </div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">UP-MCD</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onItemClick(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200/60 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                  {MENU_ICONS[item.icon] || MENU_ICONS.dashboard}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebarActivePill"
                    className="ml-auto w-1.5 h-5 rounded-full bg-blue-600"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Branding */}
        <div className="p-4 m-3 rounded-xl bg-slate-50 border border-slate-200/70">
          <p className="text-xs font-semibold text-slate-700">Civic Desk Helpline</p>
          <p className="text-[11px] text-slate-500 mt-0.5">24x7 Toll Free: 1800-180-MCD</p>
        </div>
      </aside>
    </>
  );
}
