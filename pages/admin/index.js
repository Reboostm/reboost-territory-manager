import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';

function gradeColor(grade) {
  return { A: 'text-emerald-400', B: 'text-blue-400', C: 'text-amber-400', D: 'text-orange-400', F: 'text-red-400' }[grade] || 'text-slate-400';
}

function gradeBg(grade) {
  return { A: 'bg-emerald-500/20 border-emerald-500/30', B: 'bg-blue-500/20 border-blue-500/30', C: 'bg-amber-500/20 border-amber-500/30', D: 'bg-orange-500/20 border-orange-500/30', F: 'bg-red-500/20 border-red-500/30' }[grade] || 'bg-slate-700';
}

function StatusDot({ status }) {
  const map = {
    complete: 'bg-emerald-400',
    running: 'bg-blue-400 animate-pulse',
    pending: 'bg-amber-400',
    failed: 'bg-red-400',
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${map[status] || 'bg-slate-500'} mr-2`} />;
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
      <div className="text-slate-400 text-sm mb-1">{label}</div>
      <div className="text-3xl font-extrabold text-white">{value}</div>
      {sub && <div className="text-slate-500 text-xs mt-1">{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');

  // Persist auth in session
  useEffect(() => {
    const saved = sessionStorage.getItem('admin_pass');
    if (saved) { setPassword(saved); fetchLeads(saved); }
  }, []);

  const fetchLeads = useCallback(async (pass) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/leads?password=${encodeURIComponent(pass)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setLeads(data.leads);
      setAuthed(true);
      sessionStorage.setItem('admin_pass', pass);
    } catch (e) {
      setError(e.message);
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    fetchLeads(password);
  };

  const filtered = leads
    .filter((l) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        l.lead?.businessName?.toLowerCase().includes(q) ||
        l.lead?.email?.toLowerCase().includes(q) ||
        l.lead?.city?.toLowerCase().includes(q) ||
        l.lead?.firstName?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'score') return (b.audit?.overallScore || 0) - (a.audit?.overallScore || 0);
      if (sortBy === 'score_asc') return (a.audit?.overallScore || 0) - (b.audit?.overallScore || 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const completeLeads = leads.filter((l) => l.status === 'complete');
  const avgScore = completeLeads.length
    ? Math.round(completeLeads.reduce((s, l) => s + (l.audit?.overallScore || 0), 0) / completeLeads.length)
    : 0;
  const today = leads.filter((l) => {
    if (!l.createdAt) return false;
    const d = new Date(l.createdAt);
    const n = new Date();
    return d.toDateString() === n.toDateString();
  }).length;
  const thisWeek = leads.filter((l) => {
    if (!l.createdAt) return false;
    return (Date.now() - new Date(l.createdAt)) < 7 * 24 * 60 * 60 * 1000;
  }).length;

  if (!authed) {
    return (
      <>
        <Head><title>Admin Login — Reboost SEO Audit</title></Head>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🔐</div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-slate-400 text-sm mt-1">Enter your password to access lead data</p>
            </div>
            <form onSubmit={handleLogin} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Password</label>
                <input
                  type="password"
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
              {error && <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">{error === 'Unauthorized' ? 'Incorrect password' : error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {loading ? 'Checking…' : 'Access Dashboard'}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>Lead Dashboard — Reboost SEO Audit</title></Head>
      <div className="min-h-screen bg-slate-900">
        {/* Top Bar */}
        <div className="bg-slate-800/80 border-b border-slate-700 sticky top-0 z-10 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-white">Reboost</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300 text-sm">SEO Audit Leads</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchLeads(password)}
                className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
              >
                ↻ Refresh
              </button>
              <button
                onClick={() => { setAuthed(false); sessionStorage.removeItem('admin_pass'); }}
                className="text-slate-400 hover:text-red-400 text-sm transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Leads" value={leads.length} sub="All time" />
            <StatCard label="Average Score" value={avgScore ? `${avgScore}/100` : '—'} sub="Completed audits" />
            <StatCard label="Today" value={today} sub="New submissions" />
            <StatCard label="This Week" value={thisWeek} sub="Last 7 days" />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-blue-500 text-sm"
              placeholder="Search by business, name, email, city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Newest First</option>
              <option value="score">Highest Score</option>
              <option value="score_asc">Lowest Score (hot leads)</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700">
              <span className="text-white font-semibold">{filtered.length} Lead{filtered.length !== 1 ? 's' : ''}</span>
              {search && <span className="text-slate-400 text-sm ml-2">matching "{search}"</span>}
            </div>

            {loading ? (
              <div className="text-center py-16 text-slate-400">Loading leads…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                {leads.length === 0 ? 'No leads yet — share your audit form link to start collecting!' : 'No results match your search.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      {['Business', 'Contact', 'Email', 'Phone', 'Location', 'Score', 'Status', 'Date', ''].map((h) => (
                        <th key={h} className="text-left text-slate-400 font-semibold px-4 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((l) => (
                      <tr key={l.id} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="text-white font-semibold max-w-[180px] truncate">{l.lead?.businessName}</div>
                          <div className="text-slate-500 text-xs">{l.lead?.category}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                          {l.lead?.firstName} {l.lead?.lastName}
                        </td>
                        <td className="px-4 py-3">
                          <a href={`mailto:${l.lead?.email}`} className="text-blue-400 hover:text-blue-300 max-w-[160px] block truncate">
                            {l.lead?.email}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{l.lead?.phone || '—'}</td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{l.lead?.city}, {l.lead?.state}</td>
                        <td className="px-4 py-3">
                          {l.audit ? (
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-bold text-xs ${gradeBg(l.audit.grade)}`}>
                              <span className={gradeColor(l.audit.grade)}>{l.audit.overallScore}</span>
                              <span className={gradeColor(l.audit.grade)}>/ 100</span>
                            </div>
                          ) : <span className="text-slate-500">—</span>}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="flex items-center">
                            <StatusDot status={l.status} />
                            <span className="text-slate-300 capitalize">{l.status}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          {l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {l.status === 'complete' && (
                              <Link href={`/audit/report/${l.id}`} target="_blank" className="text-blue-400 hover:text-blue-300 text-xs font-semibold whitespace-nowrap">
                                View Report ↗
                              </Link>
                            )}
                            <Link href={`/admin/leads/${l.id}`} className="text-slate-400 hover:text-white text-xs whitespace-nowrap">
                              Details
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Export hint */}
          <p className="text-slate-600 text-xs text-center">
            All leads are also synced to GoHighLevel · Reports are emailed automatically
          </p>
        </div>
      </div>
    </>
  );
}
