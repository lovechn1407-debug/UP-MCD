import React, { useState, useEffect } from 'react';
import { getDistricts } from '../services/firestore';
import { calculateHonorScore } from '../utils/helpers';

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
      .map(d => ({
        ...d,
        honorScore: calculateHonorScore(d.resolvedIssues || 0, d.totalIssues || 0)
      }))
      .sort((a, b) => b.honorScore - a.honorScore || (b.resolvedIssues || 0) - (a.resolvedIssues || 0));
    setDistricts(ranked);
    setLoading(false);
  };

  const filtered = districts.filter(d =>
    d.nameEnglish?.toLowerCase().includes(search.toLowerCase()) ||
    d.nameHindi?.includes(search) ||
    d.representativeName?.toLowerCase().includes(search.toLowerCase())
  );

  const getMedalInfo = (rank) => {
    if (rank === 0) return { bg: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)', color: '#FFFFFF', label: '1 🏆', class: 'leaderboard__medal-row--1' };
    if (rank === 1) return { bg: 'linear-gradient(135deg, #94A3B8 0%, #475569 100%)', color: '#FFFFFF', label: '2 🥈', class: 'leaderboard__medal-row--2' };
    if (rank === 2) return { bg: 'linear-gradient(135deg, #F97316 0%, #C2410C 100%)', color: '#FFFFFF', label: '3 🥉', class: 'leaderboard__medal-row--3' };
    return null;
  };

  return (
    <div className="leaderboard">
      <div className="leaderboard__header">
        <h2>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
          </svg>
          Honor Score Leaderboard
        </h2>
        <div className="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search district..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-skeleton">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton-row" />)}
        </div>
      ) : (
        <div className="leaderboard__table-wrap">
          <table className="leaderboard__table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>District</th>
                <th>Representative</th>
                <th>Total</th>
                <th>Resolved</th>
                <th>Pending</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => {
                const medal = getMedalInfo(i);
                return (
                  <tr key={d.id} className={medal ? medal.class : ''}>
                    <td>
                      {medal ? (
                        <span className="leaderboard__medal" style={{ background: medal.bg, color: medal.color }}>
                          {i + 1}
                        </span>
                      ) : (
                        <span className="leaderboard__rank">{i + 1}</span>
                      )}
                    </td>
                    <td>
                      <div className="leaderboard__district">
                        <strong>{d.nameEnglish}</strong>
                        <span>{d.nameHindi}</span>
                      </div>
                    </td>
                    <td>{d.representativeName || '—'}</td>
                    <td>{d.totalIssues || 0}</td>
                    <td className="text-success">{d.resolvedIssues || 0}</td>
                    <td className="text-warning">{(d.totalIssues || 0) - (d.resolvedIssues || 0)}</td>
                    <td>
                      <div className="leaderboard__score">
                        <div className="leaderboard__score-bar">
                          <div
                            className="leaderboard__score-fill"
                            style={{
                              width: `${d.honorScore}%`,
                              backgroundColor: d.honorScore >= 70 ? '#10B981' : d.honorScore >= 40 ? '#F59E0B' : '#EF4444'
                            }}
                          />
                        </div>
                        <span>{d.honorScore}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
