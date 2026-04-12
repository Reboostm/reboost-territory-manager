import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const ADMIN_PASSWORD = 'reboost2024';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('oms_auth', 'true');
        router.push('/dashboard');
      } else {
        setError('Incorrect password. Please try again.');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <>
      <Head>
        <title>ReBoost Marketing — Obituary Management System</title>
      </Head>
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-gold-400 text-lg font-bold uppercase tracking-widest mb-1">ReBoost Marketing</p>
            <h1 className="text-2xl font-serif text-white tracking-wide">Obituary Management System</h1>
            <p className="text-gray-500 text-sm mt-1">Admin Portal</p>
          </div>

          {/* Login Card */}
          <div className="bg-dark-800 border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-base font-medium text-white mb-6">Director Sign In</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2" htmlFor="password">
                  Admin Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full bg-dark-900 border border-gray-600 text-white rounded-xl px-4 py-3 text-sm
                             focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent
                             placeholder-gray-500 transition"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-900 bg-opacity-20 border border-red-800 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-60 disabled:cursor-not-allowed
                           text-white font-medium py-3 rounded-xl transition text-sm tracking-wide"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 space-y-1">
            <p className="text-gray-600 text-xs">
              © {new Date().getFullYear()} ReBoost Marketing · Obituary Management System
            </p>
            <p className="text-gray-700 text-xs">
              Powered by ReBoost Marketing
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
