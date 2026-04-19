import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const CATEGORIES = [
  'Plumber', 'HVAC / Heating & Cooling', 'Electrician', 'Roofer', 'General Contractor',
  'Landscaping / Lawn Care', 'Cleaning Service', 'Pest Control', 'Handyman',
  'Dentist', 'Chiropractor', 'Doctor / Medical', 'Veterinarian', 'Physical Therapy',
  'Law Firm / Attorney', 'Accountant / CPA', 'Insurance Agency', 'Mortgage / Financial',
  'Real Estate Agent', 'Restaurant / Food', 'Salon / Barber', 'Gym / Fitness',
  'Auto Repair', 'Retail Store', 'Other',
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA',
  'ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK',
  'OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

const SOURCES = ['Google Search', 'Facebook / Instagram', 'Referral from Someone', 'LinkedIn', 'Other'];

export default function AuditForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    businessName: '', category: '', city: '', state: '', website: '',
    firstName: '', lastName: '', email: '', phone: '', source: '',
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validateStep1 = () => {
    if (!form.businessName.trim()) return 'Enter your business name';
    if (!form.category) return 'Select your business type';
    if (!form.city.trim()) return 'Enter your city';
    if (!form.state) return 'Select your state';
    return null;
  };

  const validateStep2 = () => {
    if (!form.firstName.trim()) return 'Enter your first name';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/audit/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      router.push(`/audit/processing/${data.id}`);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Free Local SEO Audit — See How You Rank on Google</title>
        <meta name="description" content="Get a free instant audit showing exactly where your business ranks on Google Maps, how you compare to competitors, and what to fix first." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        {/* Hero */}
        <div className="text-center pt-16 pb-10 px-4">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-blue-300 text-sm font-medium">Free · Instant · No Credit Card</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            How Does Your Business<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Show Up on Google?
            </span>
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">
            Get your free Local SEO Audit in 60 seconds — Map Pack ranking, Google profile score, website performance, and a personalized action plan.
          </p>
        </div>

        {/* Form Card */}
        <div className="max-w-lg mx-auto px-4 pb-20">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Progress */}
            <div className="flex border-b border-slate-100">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`flex-1 py-3 text-center text-sm font-semibold transition-colors ${
                    step === s ? 'bg-blue-600 text-white' : step > s ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  {step > s ? '✓ ' : `${s}. `}
                  {s === 1 ? 'Your Business' : 'Contact Info'}
                </div>
              ))}
            </div>

            <div className="p-8">
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-1">Tell us about your business</h2>
                    <p className="text-slate-500 text-sm">We'll analyze exactly how you appear in local search.</p>
                  </div>

                  <Field label="Business Name *" id="businessName">
                    <input
                      id="businessName"
                      className="input"
                      placeholder="e.g. Austin Pro Plumbing"
                      value={form.businessName}
                      onChange={(e) => set('businessName', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    />
                  </Field>

                  <Field label="Business Type *" id="category">
                    <select id="category" className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                      <option value="">Select a category…</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="City *" id="city">
                      <input id="city" className="input" placeholder="Austin" value={form.city} onChange={(e) => set('city', e.target.value)} />
                    </Field>
                    <Field label="State *" id="state">
                      <select id="state" className="input" value={form.state} onChange={(e) => set('state', e.target.value)}>
                        <option value="">State…</option>
                        {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                  </div>

                  <Field label="Website URL" id="website" hint="Optional but improves accuracy">
                    <input id="website" className="input" placeholder="www.yourbusiness.com" value={form.website} onChange={(e) => set('website', e.target.value)} />
                  </Field>

                  {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

                  <button onClick={handleNext} className="btn-primary w-full">
                    Analyze My Business →
                  </button>

                  <p className="text-center text-xs text-slate-400">
                    Takes about 60 seconds · 100% free
                  </p>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <button onClick={() => { setStep(1); setError(''); }} className="text-blue-600 text-sm flex items-center gap-1 mb-3 hover:underline">
                      ← Back
                    </button>
                    <h2 className="text-xl font-bold text-slate-800 mb-1">Where should we send your report?</h2>
                    <p className="text-slate-500 text-sm">We'll email you a full PDF breakdown of your results.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="First Name *" id="firstName">
                      <input id="firstName" className="input" placeholder="John" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
                    </Field>
                    <Field label="Last Name" id="lastName">
                      <input id="lastName" className="input" placeholder="Smith" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
                    </Field>
                  </div>

                  <Field label="Email Address *" id="email">
                    <input id="email" type="email" className="input" placeholder="john@yourbusiness.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
                  </Field>

                  <Field label="Phone Number" id="phone" hint="Optional">
                    <input id="phone" type="tel" className="input" placeholder="(512) 555-0100" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                  </Field>

                  <Field label="How did you find us?" id="source">
                    <select id="source" className="input" value={form.source} onChange={(e) => set('source', e.target.value)}>
                      <option value="">Select…</option>
                      {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>

                  {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

                  <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Starting Analysis…
                      </span>
                    ) : 'Get My Free SEO Report →'}
                  </button>

                  <p className="text-center text-xs text-slate-400">
                    No spam. Unsubscribe anytime. Your data is never sold.
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Trust Signals */}
          <div className="grid grid-cols-3 gap-3 mt-6 text-center">
            {[
              { icon: '🔒', label: 'Secure & Private' },
              { icon: '⚡', label: 'Results in 60s' },
              { icon: '🎯', label: 'Actionable Insights' },
            ].map((t) => (
              <div key={t.label} className="bg-white/10 backdrop-blur rounded-xl p-3">
                <div className="text-2xl mb-1">{t.icon}</div>
                <div className="text-slate-300 text-xs font-medium">{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 15px;
          color: #1e293b;
          outline: none;
          background: white;
          transition: border-color 0.15s;
          appearance: auto;
        }
        .input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .btn-primary {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          font-weight: 700;
          font-size: 16px;
          padding: 14px 24px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
          display: block;
          text-align: center;
        }
        .btn-primary:hover { opacity: 0.92; transform: translateY(-1px); }
      `}</style>
    </>
  );
}

function Field({ label, id, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}
        {hint && <span className="font-normal text-slate-400 ml-1">({hint})</span>}
      </label>
      {children}
    </div>
  );
}
