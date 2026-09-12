import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Award, Trophy, CheckCircle, Clock, XCircle, Search, Building2, Phone } from 'lucide-react';

export const Leaderboard = () => {
  const { getLeaderboardData } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const leaderboard = getLeaderboardData();

  const filteredData = leaderboard.filter(item => 
    item.districtName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.representative.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-3 border border-amber-400/30">
              <Trophy className="w-4 h-4 text-amber-400" />
              UP Governance & Efficiency Ranking
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Uttar Pradesh District Honor Scoreboard
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl mt-1">
              Public accountability leaderboard ranking all UP Districts based on civic complaint resolution rates, fast response time, and unfulfilled issue metrics.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center min-w-[160px]">
            <span className="text-xs text-slate-300 font-semibold block">Top Performing District</span>
            <span className="text-xl font-black text-amber-400 block mt-1">
              🏆 {leaderboard[0]?.districtName || "Lucknow"}
            </span>
            <span className="text-xs text-emerald-400 font-bold block">
              Honor Score: {leaderboard[0]?.honorScore || 100}%
            </span>
          </div>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search district name or DM representative..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Showing <span className="text-slate-900 font-extrabold">{filteredData.length}</span> Districts
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                <th className="py-4 px-4 sm:px-6 text-center">Rank</th>
                <th className="py-4 px-4 sm:px-6">District & DM Representative</th>
                <th className="py-4 px-4 text-center">Total Issues</th>
                <th className="py-4 px-4 text-center">Resolved</th>
                <th className="py-4 px-4 text-center">Unfulfilled</th>
                <th className="py-4 px-4 sm:px-6 text-right">Honor Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredData.map((item, index) => {
                const rank = index + 1;
                const isTop3 = rank <= 3;

                return (
                  <tr key={item.districtId} className="hover:bg-slate-50/80 transition-all">
                    {/* Rank Badge */}
                    <td className="py-4 px-4 text-center font-bold">
                      {rank === 1 && (
                        <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center justify-center font-black shadow-sm">
                          🥇
                        </span>
                      )}
                      {rank === 2 && (
                        <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 border border-slate-300 inline-flex items-center justify-center font-black shadow-sm">
                          🥈
                        </span>
                      )}
                      {rank === 3 && (
                        <span className="w-8 h-8 rounded-full bg-amber-700/20 text-amber-900 border border-amber-700/30 inline-flex items-center justify-center font-black shadow-sm">
                          🥉
                        </span>
                      )}
                      {rank > 3 && (
                        <span className="text-slate-500 font-mono">#{rank}</span>
                      )}
                    </td>

                    {/* District & Representative Details */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800 font-bold shrink-0">
                          <Building2 className="w-5 h-5 text-blue-700" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-base">
                            {item.districtName}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-slate-700">DM: {item.representative}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-600">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {item.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Total Issues */}
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-full text-xs border border-slate-200">
                        {item.totalIssues}
                      </span>
                    </td>

                    {/* Resolved */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        {item.issuesResolved}
                      </span>
                    </td>

                    {/* Unfulfilled */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 font-bold text-xs px-3 py-1 rounded-full border ${
                        item.issuesUnfulfilled > 0 
                          ? 'bg-amber-50 text-amber-800 border-amber-200' 
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        {item.issuesUnfulfilled}
                      </span>
                    </td>

                    {/* Honor Score Rating */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="inline-flex flex-col items-end">
                        <div className="flex items-center gap-1">
                          <Award className={`w-4 h-4 ${
                            item.honorScore >= 80 ? 'text-amber-500' : item.honorScore >= 50 ? 'text-blue-500' : 'text-slate-400'
                          }`} />
                          <span className={`text-lg font-black ${
                            item.honorScore >= 80 ? 'text-emerald-700' : item.honorScore >= 50 ? 'text-blue-700' : 'text-slate-600'
                          }`}>
                            {item.honorScore}%
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden mt-1 border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.honorScore >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                            }`}
                            style={{ width: `${Math.max(item.honorScore, 5)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
