import React, { useState, useEffect } from 'react';
import { getDistricts } from '../services/firestore';
import { calculateHonorScore } from '../utils/helpers';
import { Trophy, Search, Award, Loader2, MapPin } from 'lucide-react';

export default function LeaderboardPanel() {
  const [districts, setDistricts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDistricts();
  }, []);

  const loadDistricts = async () => {
    setLoading(true);
    const data = await getDistricts();
    const ranked = data
      .map((d) => ({
        ...d,
        honorScore: calculateHonorScore(d.resolvedIssues || 0, d.totalIssues || 0)
      }))
      .sort((a, b) => b.honorScore - a.honorScore || (b.resolvedIssues || 0) - (a.resolvedIssues || 0));
    setDistricts(ranked);
    setLoading(false);
  };

  const filtered = districts.filter(
    (d) =>
      d.nameEnglish?.toLowerCase().includes(search.toLowerCase()) ||
      d.nameHindi?.includes(search) ||
      d.representativeName?.toLowerCase().includes(search.toLowerCase())
  );

  const getRankBadge = (rank) => {
    if (rank === 0)
      return (
        <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 font-black text-sm flex items-center justify-center shadow-sm border border-amber-300">
          🥇 1
        </span>
      );
    if (rank === 1)
      return (
        <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-300 to-slate-200 text-slate-800 font-black text-sm flex items-center justify-center shadow-sm border border-slate-300">
          🥈 2
        </span>
      );
    if (rank === 2)
      return (
        <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-700 to-amber-600 text-white font-black text-sm flex items-center justify-center shadow-sm border border-amber-600">
          🥉 3
        </span>
      );
    return (
      <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center border border-slate-200">
        #{rank + 1}
      </span>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">District Honor Score Leaderboard</h2>
            <p className="text-xs text-slate-500">
              Performance ratings based on issue resolution speed & completion SLA
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Calculating district rankings...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Representative</th>
                <th className="py-3 px-4 text-center">Total Issues</th>
                <th className="py-3 px-4 text-center">Resolved</th>
                <th className="py-3 px-4 text-center">Pending</th>
                <th className="py-3 px-4 text-right">Honor Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((d, i) => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">{getRankBadge(i)}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        {d.nameEnglish}
                      </span>
                      {d.nameHindi && <span className="text-[11px] text-slate-400">{d.nameHindi}</span>}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{d.representativeName || 'Unassigned'}</td>
                  <td className="py-3.5 px-4 text-center font-bold">{d.totalIssues || 0}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                    {d.resolvedIssues || 0}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-amber-600">
                    {(d.totalIssues || 0) - (d.resolvedIssues || 0)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full transition-all ${
                            d.honorScore >= 70
                              ? 'bg-emerald-500'
                              : d.honorScore >= 40
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${d.honorScore}%` }}
                        />
                      </div>
                      <span className="font-extrabold text-xs text-slate-900 w-10">{d.honorScore}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
