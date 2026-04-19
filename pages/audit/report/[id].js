import Head from 'next/head';
import { db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const CALENDAR_LINK = process.env.NEXT_PUBLIC_CALENDAR_LINK || '#';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gradeColor(grade) {
  return { A: '#10B981', B: '#3B82F6', C: '#F59E0B', D: '#F97316', F: '#EF4444' }[grade] || '#64748b';
}

function scoreBarColor(score, max) {
  const pct = score / max;
  if (pct >= 0.7) return 'bg-emerald-500';
  if (pct >= 0.45) return 'bg-amber-400';
  return 'bg-red-500';
}

function ScoreCircle({ score, grade, label }) {
  const color = gradeColor(grade);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
          <circle
            cx="70" cy="70" r={r} fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dasharray 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold text-white">{score}</span>
          <span className="text-sm text-slate-400 -mt-1">/100</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="text-2xl font-bold" style={{ color }}>Grade {grade}</div>
        <div className="text-slate-400 text-sm">{label}</div>
      </div>
    </div>
  );
}

function MetricCard({ title, score, maxScore, icon, children }) {
  const pct = maxScore ? Math.round((score / maxScore) * 100) : 0;
  const barClass = scoreBarColor(score, maxScore);
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-2xl mb-1">{icon}</div>
          <h3 className="text-white font-bold text-lg">{title}</h3>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold text-white">{score}</div>
          <div className="text-slate-400 text-sm">/ {maxScore} pts</div>
        </div>
      </div>
      <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden mb-4">
        <div className={`h-full ${barClass} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      {children}
    </div>
  );
}

function CheckRow({ label, pass, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
      <div className="flex items-center gap-2">
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${pass ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {pass ? '✓' : '✗'}
        </span>
        <span className="text-slate-300 text-sm">{label}</span>
      </div>
      {value != null && <span className={`text-sm font-semibold ${pass ? 'text-emerald-400' : 'text-red-400'}`}>{value}</span>}
    </div>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    critical: 'bg-red-500/20 text-red-400 border border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    low: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  };
  return (
    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${styles[priority] || styles.low}`}>
      {priority}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportPage({ lead, audit, generatedAt, notFound }) {
  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">Report Not Found</h1>
          <p className="text-slate-400">This report may still be processing.</p>
        </div>
      </div>
    );
  }

  const { gmb, ranking, website, overallScore, grade, gradeLabel, actionItems } = audit;
  const mapQuery = encodeURIComponent(`${lead.businessName} ${lead.city} ${lead.state}`);
  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&output=embed&z=13`;

  return (
    <>
      <Head>
        <title>{lead.businessName} — Local SEO Report</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-slate-900">
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-slate-700">
          <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
              <div>
                <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-2">Local SEO Audit Report</p>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">{lead.businessName}</h1>
                <p className="text-slate-400">{lead.city}, {lead.state} · {lead.category}</p>
                {generatedAt && (
                  <p className="text-slate-500 text-sm mt-1">Generated {new Date(generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                )}
              </div>
              <ScoreCircle score={overallScore} grade={grade} label={gradeLabel} />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

          {/* ── Score Overview Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Google Business Profile', score: gmb?.score || 0, max: 40, icon: '🏢', grade: gmb?.score >= 32 ? 'A' : gmb?.score >= 24 ? 'B' : gmb?.score >= 16 ? 'C' : 'D' },
              { label: 'Map Pack Ranking', score: ranking?.score || 0, max: 30, icon: '📍', grade: ranking?.score >= 25 ? 'A' : ranking?.score >= 15 ? 'B' : ranking?.score >= 5 ? 'C' : 'D' },
              { label: 'Website Performance', score: website?.score || 0, max: 30, icon: '🌐', grade: website?.score >= 24 ? 'A' : website?.score >= 18 ? 'B' : website?.score >= 12 ? 'C' : 'D' },
            ].map((m) => (
              <div key={m.label} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 text-center">
                <div className="text-3xl mb-2">{m.icon}</div>
                <div className="text-slate-400 text-sm mb-2">{m.label}</div>
                <div className="text-4xl font-extrabold text-white">{m.score}</div>
                <div className="text-slate-400 text-sm mb-3">/ {m.max} points</div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${scoreBarColor(m.score, m.max)}`}
                    style={{ width: `${(m.score / m.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ── Map ── */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-700">
              <h2 className="text-white font-bold text-xl flex items-center gap-2">
                📍 Your Google Maps Presence
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {ranking?.mapPackPosition
                  ? `You appear at position #${ranking.mapPackPosition} for "${ranking.keyword}"`
                  : `We searched for "${ranking?.keyword || `${lead.category} in ${lead.city}, ${lead.state}`}" — see how competitors dominate.`}
              </p>
            </div>
            <div className="relative" style={{ paddingBottom: '52%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={mapSrc}
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            {ranking?.mapPackPosition ? (
              <div className="p-4 bg-emerald-900/30 border-t border-emerald-700/30 flex items-center gap-3">
                <span className="text-2xl">🎉</span>
                <span className="text-emerald-300 font-semibold">
                  You rank #{ranking.mapPackPosition} in the Google Map Pack — great start! Let's push you to #1.
                </span>
              </div>
            ) : (
              <div className="p-4 bg-red-900/30 border-t border-red-700/30 flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <span className="text-red-300 font-semibold">
                  You're not showing in the Map Pack for your keyword — 80% of local clicks go to these 3 spots.
                </span>
              </div>
            )}
          </div>

          {/* ── GMB Section ── */}
          <MetricCard title="Google Business Profile" score={gmb?.score || 0} maxScore={40} icon="🏢">
            {gmb?.found ? (
              <div className="space-y-0.5">
                <CheckRow label="Found on Google" pass={true} value={gmb.rating ? `⭐ ${gmb.rating}` : undefined} />
                <CheckRow label="Star Rating (4.0+ ideal)" pass={(gmb.rating || 0) >= 4.0} value={gmb.rating ? `${gmb.rating} stars` : 'N/A'} />
                <CheckRow label="Review Count (20+ ideal)" pass={(gmb.reviewCount || 0) >= 20} value={`${gmb.reviewCount || 0} reviews`} />
                <CheckRow label="Photos Added (5+ ideal)" pass={(gmb.photoCount || 0) >= 5} value={`${gmb.photoCount || 0} photos`} />
                <CheckRow label="Website Linked" pass={gmb.hasWebsite} />
                <CheckRow label="Business Hours Set" pass={gmb.hasHours} />
                <CheckRow label="Business Description" pass={gmb.hasDescription} />
              </div>
            ) : (
              <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4">
                <p className="text-red-300 font-semibold">❌ No Google Business Profile found</p>
                <p className="text-red-400 text-sm mt-1">This is critical. You're invisible to anyone searching for your services locally.</p>
              </div>
            )}
          </MetricCard>

          {/* ── Competitors ── */}
          {ranking?.competitors?.length > 0 && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-white font-bold text-xl mb-1">🏆 Your Top Competitors</h2>
              <p className="text-slate-400 text-sm mb-5">These businesses are capturing the customers searching for your services.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-slate-400 font-semibold pb-3">Rank</th>
                      <th className="text-left text-slate-400 font-semibold pb-3">Business</th>
                      <th className="text-center text-slate-400 font-semibold pb-3">Rating</th>
                      <th className="text-center text-slate-400 font-semibold pb-3">Reviews</th>
                      <th className="text-left text-slate-400 font-semibold pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.competitors.map((c, i) => (
                      <tr key={i} className="border-b border-slate-700/50 last:border-0">
                        <td className="py-3 pr-4">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-amber-400 text-amber-900' : 'bg-slate-700 text-slate-300'}`}>
                            #{c.position}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-white font-medium">{c.name}</td>
                        <td className="py-3 text-center text-amber-400 font-semibold">⭐ {c.rating || '—'}</td>
                        <td className="py-3 text-center text-slate-300">{c.reviews?.toLocaleString() || '—'}</td>
                        <td className="py-3">
                          <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full border border-emerald-500/30">
                            Outranking You
                          </span>
                        </td>
                      </tr>
                    ))}
                    {/* Your business row */}
                    <tr className="bg-blue-900/20">
                      <td className="py-3 pr-4">
                        <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-blue-600 text-white">
                          {ranking.mapPackPosition ? `#${ranking.mapPackPosition}` : '—'}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-blue-300 font-bold">{lead.businessName} (You)</td>
                      <td className="py-3 text-center text-amber-400 font-semibold">⭐ {gmb?.rating || '—'}</td>
                      <td className="py-3 text-center text-slate-300">{gmb?.reviewCount?.toLocaleString() || '0'}</td>
                      <td className="py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${ranking.mapPackPosition && ranking.mapPackPosition <= 3 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                          {ranking.mapPackPosition ? `Rank #${ranking.mapPackPosition}` : 'Not Ranking'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Website ── */}
          {website && (
            <MetricCard title="Website Performance" score={website.score || 0} maxScore={30} icon="🌐">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Mobile Speed', value: website.mobileScore, max: 100 },
                  { label: 'Desktop Speed', value: website.desktopScore, max: 100 },
                  { label: 'SEO Score', value: website.seoScore, max: 100 },
                  { label: 'Accessibility', value: website.accessibilityScore, max: 100 },
                ].map((m) => m.value != null && (
                  <div key={m.label} className="bg-slate-900/50 rounded-xl p-3 text-center">
                    <div className={`text-2xl font-extrabold ${m.value >= 70 ? 'text-emerald-400' : m.value >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {m.value}
                    </div>
                    <div className="text-slate-400 text-xs mt-1">{m.label}</div>
                  </div>
                ))}
              </div>
              {website.lcp && (
                <p className="text-slate-400 text-sm mt-3">Largest Contentful Paint: <span className="text-white font-semibold">{website.lcp}</span> · CLS: <span className="text-white font-semibold">{website.cls}</span></p>
              )}
            </MetricCard>
          )}

          {/* ── Action Items ── */}
          {actionItems?.length > 0 && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-white font-bold text-xl mb-1">🎯 Your Priority Action Plan</h2>
              <p className="text-slate-400 text-sm mb-5">Fix these in order for the fastest ranking improvements.</p>
              <div className="space-y-4">
                {actionItems.map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-white font-semibold">{item.title}</span>
                        <PriorityBadge priority={item.priority} />
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CTA ── */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-10 text-center">
            <h2 className="text-white text-2xl md:text-3xl font-extrabold mb-3">
              Ready to Dominate Local Search?
            </h2>
            <p className="text-blue-100 text-base mb-6 max-w-lg mx-auto">
              Our team implements everything in this report for you. Most clients see measurable ranking improvements within 60 days — guaranteed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={CALENDAR_LINK}
                className="bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg"
              >
                Book a Free Strategy Call →
              </a>
            </div>
            <p className="text-blue-200 text-sm mt-4">No sales pressure · 30 minutes · Specific to your business</p>
          </div>

          {/* Footer */}
          <div className="text-center text-slate-600 text-sm pb-4">
            <p>Report generated by Reboost Marketing · <a href="/audit" className="text-slate-500 hover:text-slate-400">Run another audit</a></p>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const snap = await getDoc(doc(db, 'seo_audits', params.id));
    if (!snap.exists() || snap.data().status !== 'complete') {
      return { redirect: { destination: `/audit/processing/${params.id}`, permanent: false } };
    }

    const data = snap.data();
    return {
      props: {
        lead: data.lead,
        audit: data.audit,
        generatedAt: data.completedAt?.toDate?.()?.toISOString() || null,
        notFound: false,
      },
    };
  } catch (e) {
    return { props: { notFound: true, lead: null, audit: null, generatedAt: null } };
  }
}
