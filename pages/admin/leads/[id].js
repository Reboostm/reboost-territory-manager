import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

function Section({ title, children }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
      <h3 className="text-white font-bold text-lg mb-4 border-b border-slate-700 pb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-700/40 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-white text-sm font-medium text-right max-w-xs">{value ?? '—'}</span>
    </div>
  );
}

function gradeColor(grade) {
  return { A: '#10B981', B: '#3B82F6', C: '#F59E0B', D: '#F97316', F: '#EF4444' }[grade] || '#64748b';
}

export default function LeadDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const pass = sessionStorage.getItem('admin_pass');
    if (!pass) { router.push('/admin'); return; }

    fetch(`/api/admin/leads/${id}?password=${encodeURIComponent(pass)}`)
      .then((r) => r.json())
      .then((d) => { if (d.error) throw new Error(d.error); setData(d); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading lead…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-red-400">{error || 'Lead not found'}</div>
      </div>
    );
  }

  const { lead, audit, status, createdAt, completedAt } = data;

  return (
    <>
      <Head><title>{lead.businessName} — Lead Detail</title></Head>
      <div className="min-h-screen bg-slate-900">
        <div className="bg-slate-800/80 border-b border-slate-700 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/admin" className="text-slate-400 hover:text-white text-sm">← All Leads</Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300 text-sm truncate">{lead.businessName}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{lead.businessName}</h1>
              <p className="text-slate-400">{lead.city}, {lead.state} · {lead.category}</p>
            </div>
            {audit && (
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-5xl font-extrabold" style={{ color: gradeColor(audit.grade) }}>
                    {audit.overallScore}
                  </div>
                  <div className="text-slate-400 text-sm">/ 100</div>
                </div>
                <div>
                  <div className="text-3xl font-bold" style={{ color: gradeColor(audit.grade) }}>Grade {audit.grade}</div>
                  <div className="text-slate-400 text-sm">{audit.gradeLabel}</div>
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <Section title="Contact Information">
              <Row label="Name" value={`${lead.firstName || ''} ${lead.lastName || ''}`.trim()} />
              <Row label="Email" value={<a href={`mailto:${lead.email}`} className="text-blue-400">{lead.email}</a>} />
              <Row label="Phone" value={lead.phone ? <a href={`tel:${lead.phone}`} className="text-blue-400">{lead.phone}</a> : null} />
              <Row label="Source" value={lead.source} />
              <Row label="Website" value={lead.website ? <a href={lead.website} target="_blank" rel="noreferrer" className="text-blue-400 truncate block max-w-[180px]">{lead.website}</a> : null} />
              <Row label="Submitted" value={createdAt ? new Date(createdAt).toLocaleString() : null} />
              <Row label="Completed" value={completedAt ? new Date(completedAt).toLocaleString() : null} />
              <Row label="Status" value={<span className="capitalize">{status}</span>} />
            </Section>

            {/* Score Breakdown */}
            {audit && (
              <Section title="Score Breakdown">
                <Row label="Overall Score" value={`${audit.overallScore} / 100 (${audit.grade})`} />
                <Row label="Google Business Profile" value={`${audit.gmb?.score || 0} / 40 pts`} />
                <Row label="Map Pack Ranking" value={`${audit.ranking?.score || 0} / 30 pts`} />
                <Row label="Website Performance" value={`${audit.website?.score || 0} / 30 pts`} />
                <Row label="Map Pack Position" value={audit.ranking?.mapPackPosition ? `#${audit.ranking.mapPackPosition}` : 'Not ranking'} />
                <Row label="Search Keyword" value={audit.ranking?.keyword} />
                <Row label="GMB Rating" value={audit.gmb?.rating ? `⭐ ${audit.gmb.rating}` : null} />
                <Row label="GMB Reviews" value={audit.gmb?.reviewCount} />
              </Section>
            )}

            {/* Website Scores */}
            {audit?.website && (
              <Section title="Website Performance">
                <Row label="Mobile Speed" value={audit.website.mobileScore != null ? `${audit.website.mobileScore}/100` : null} />
                <Row label="Desktop Speed" value={audit.website.desktopScore != null ? `${audit.website.desktopScore}/100` : null} />
                <Row label="SEO Score" value={audit.website.seoScore != null ? `${audit.website.seoScore}/100` : null} />
                <Row label="Accessibility" value={audit.website.accessibilityScore != null ? `${audit.website.accessibilityScore}/100` : null} />
                <Row label="LCP" value={audit.website.lcp} />
                <Row label="CLS" value={audit.website.cls} />
              </Section>
            )}

            {/* Competitors */}
            {audit?.ranking?.competitors?.length > 0 && (
              <Section title="Top Competitors">
                {audit.ranking.competitors.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/40 last:border-0">
                    <div>
                      <span className="text-slate-400 text-xs mr-2">#{c.position}</span>
                      <span className="text-white text-sm">{c.name}</span>
                    </div>
                    <div className="text-right text-sm">
                      <span className="text-amber-400">⭐ {c.rating || '—'}</span>
                      <span className="text-slate-500 ml-2">({c.reviews?.toLocaleString() || '0'} reviews)</span>
                    </div>
                  </div>
                ))}
              </Section>
            )}
          </div>

          {/* Action Items */}
          {audit?.actionItems?.length > 0 && (
            <Section title="Action Items">
              <div className="space-y-3">
                {audit.actionItems.map((item, i) => (
                  <div key={i} className="p-4 bg-slate-900/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-sm font-semibold">{i + 1}. {item.title}</span>
                      <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded-full border ${
                        item.priority === 'critical' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                        item.priority === 'high' ? 'text-orange-400 border-orange-500/30 bg-orange-500/10' :
                        'text-amber-400 border-amber-500/30 bg-amber-500/10'
                      }`}>{item.priority}</span>
                    </div>
                    <p className="text-slate-400 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {status === 'complete' && (
              <Link
                href={`/audit/report/${id}`}
                target="_blank"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                View Customer Report ↗
              </Link>
            )}
            <a
              href={`mailto:${lead.email}?subject=Your SEO Audit for ${lead.businessName}&body=Hi ${lead.firstName},%0D%0A%0D%0AThank you for using our free SEO audit tool.`}
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Email This Lead
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
