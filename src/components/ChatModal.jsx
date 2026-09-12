import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { MessageSquare, Send, X, User, Building2, HardHat, ShieldAlert } from 'lucide-react';

export const ChatModal = ({ complaint, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { chats, sendMessage } = useApp();

  const [text, setText] = useState('');

  if (!isOpen || !complaint) return null;

  const currentChat = chats.find(c => c.complaintId === complaint.id);
  const messages = currentChat ? currentChat.messages : [];

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !currentUser) return;

    sendMessage(complaint.id, {
      senderRole: currentUser.role,
      senderName: currentUser.name,
      text: text.trim()
    });

    setText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full h-[600px] max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Issue Discussion Thread</h3>
              <p className="text-xs text-slate-300 font-mono">Ticket: {complaint.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Complaint Context Summary */}
        <div className="bg-blue-50/80 px-4 py-2.5 border-b border-blue-100 flex items-center justify-between text-xs">
          <div className="truncate font-semibold text-blue-900">
            <span className="text-slate-500 font-normal">Type: </span>
            {complaint.complaintType}
          </div>
          <div className="shrink-0 bg-white px-2 py-0.5 rounded font-bold text-slate-700 border border-blue-200">
            {complaint.district}
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No chat messages yet. Start the conversation with your District Admin & Worker!
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = currentUser?.role === msg.senderRole;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold mb-1 px-1">
                    {msg.senderRole === 'master' && <ShieldAlert className="w-3 h-3 text-purple-600 inline" />}
                    {msg.senderRole === 'admin' && <Building2 className="w-3 h-3 text-blue-600 inline" />}
                    {msg.senderRole === 'worker' && <HardHat className="w-3 h-3 text-amber-600 inline" />}
                    {msg.senderRole === 'client' && <User className="w-3 h-3 text-emerald-600 inline" />}
                    <span>{msg.senderName} ({msg.senderRole})</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-sm ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>

                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            className="input-field py-2"
            placeholder="Type your message here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="btn-primary py-2 px-4 shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
