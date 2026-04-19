import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const STEPS = [
  { label: 'Searching Google Business Profile…', duration: 1500 },
  { label: 'Checking your Map Pack ranking…', duration: 2000 },
  { label: 'Analyzing competitors in your area…', duration: 1800 },
  { label: 'Testing website performance…', duration: 2200 },
  { label: 'Calculating your SEO score…', duration: 1200 },
  { label: 'Building your personalized report…', duration: 1000 },
];

export default function Processing() {
  const router = useRouter();
  const { id } = router.query;

  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false);
  const runCalled = useRef(false);

  // Kick off the audit
  useEffect(() => {
    if (!id || runCalled.current) return;
    runCalled.current = true;

    fetch('/api/audit/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(console.error);

    setStarted(true);
  }, [id]);

  // Animate steps
  useEffect(() => {
    if (!started) return;
    let stepIdx = 0;
    let totalElapsed = 0;
    const totalDuration = STEPS.reduce((s, st) => s + st.duration, 0);

    function runStep() {
      if (stepIdx >= STEPS.length) return;
      setCurrentStep(stepIdx);
      totalElapsed += STEPS[stepIdx].duration;
      const targetProgress = Math.round((totalElapsed / totalDuration) * 90); // cap at 90 until real complete

      const stepTimeout = setTimeout(() => {
        setCompletedSteps((p) => [...p, stepIdx]);
        setProgress(targetProgress);
        stepIdx++;
        runStep();
      }, STEPS[stepIdx].duration);

      return stepTimeout;
    }

    const t = runStep();
    return () => clearTimeout(t);
  }, [started]);

  // Poll for completion
  useEffect(() => {
    if (!id) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/audit/status/${id}`);
        const data = await res.json();
        if (data.status === 'complete') {
          clearInterval(interval);
          setProgress(100);
          setTimeout(() => router.push(`/audit/report/${id}`), 800);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          router.push(`/audit/report/${id}?error=1`);
        }
      } catch {
        // swallow network errors, keep polling
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [id, router]);

  return (
    <>
      <Head>
        <title>Analyzing Your Business… — Reboost SEO Audit</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Spinner */}
          <div className="text-center mb-10">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full border-4 border-blue-900"></div>
              <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-3xl">🔍</div>
            </div>
            <h1 className="text-white text-2xl font-bold mt-6 mb-2">Analyzing Your Business</h1>
            <p className="text-slate-400 text-sm">This takes about 30–60 seconds. Hang tight…</p>
          </div>

          {/* Progress Bar */}
          <div className="bg-slate-800 rounded-full h-2.5 mb-8 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {STEPS.map((step, i) => {
              const done = completedSteps.includes(i);
              const active = currentStep === i && !done;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                    done ? 'bg-green-900/30' : active ? 'bg-blue-900/40' : 'opacity-30'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                    done ? 'bg-green-500' : active ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'
                  }`}>
                    {done ? '✓' : active ? '…' : i + 1}
                  </div>
                  <span className={`text-sm font-medium ${done ? 'text-green-300' : active ? 'text-white' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-center text-slate-500 text-xs mt-8">
            We check 20+ data points across Google, Maps, and your website
          </p>
        </div>
      </div>
    </>
  );
}
