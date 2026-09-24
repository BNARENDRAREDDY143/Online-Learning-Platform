import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import { ShieldCheck, Search, Award, CheckCircle2, XCircle, Calendar, User, BookOpen } from 'lucide-react';

export const VerifyCertificate = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const certIdFromUrl = searchParams.get('id') || '';
  const [certInput, setCertInput] = useState(certIdFromUrl);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (certIdFromUrl) {
      handleLookup(certIdFromUrl);
    }
  }, [certIdFromUrl]);

  const handleLookup = async (code) => {
    if (!code?.trim()) return;
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await API.get(`/certificates/verify/${code.trim()}`);
      if (res.data.success) {
        setResult(res.data.certificate);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Certificate record not found. Please verify the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ id: certInput.trim() });
    handleLookup(certInput.trim());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" />
          Public Credential Verification
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Verify Academic Credentials
        </h1>
        <p className="text-xs text-slate-400">
          Enter any LearnPulse Certificate Identification Number below to verify its authenticity, student record, and issuing criteria.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. CERT-2026-MERN99"
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-2xl text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase tracking-wider"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-indigo-600/30 whitespace-nowrap"
          >
            {loading ? 'Verifying...' : 'Verify Certificate'}
          </button>
        </form>

        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
          <span>Demo Certificate to test:</span>
          <button
            type="button"
            onClick={() => {
              setCertInput('CERT-2026-MERN99');
              handleLookup('CERT-2026-MERN99');
            }}
            className="text-indigo-400 font-mono font-bold hover:underline"
          >
            CERT-2026-MERN99
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="max-w-2xl mx-auto p-5 glass-panel rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-center gap-3 text-xs">
          <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
          <div>
            <h4 className="font-bold">Invalid or Unverified ID</h4>
            <p className="text-[11px] text-rose-300/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Verified Certificate Card */}
      {result && (
        <div className="max-w-2xl mx-auto glass-panel p-8 rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/20 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  Valid & Authenticated Credential
                </span>
                <h3 className="text-lg font-bold text-white">Certificate of Completion</h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">ID NUMBER</span>
              <span className="font-mono text-xs font-bold text-amber-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                {result.certificateNumber}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="glass-card p-4 rounded-2xl space-y-1">
              <div className="text-slate-400 flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-indigo-400" /> Recipient Name
              </div>
              <div className="text-sm font-bold text-white">{result.studentName}</div>
            </div>

            <div className="glass-card p-4 rounded-2xl space-y-1">
              <div className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Issue Date
              </div>
              <div className="text-sm font-bold text-white">
                {new Date(result.issueDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl space-y-1 sm:col-span-2">
              <div className="text-slate-400 flex items-center gap-1.5 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Completed Masterclass
              </div>
              <div className="text-base font-bold text-indigo-300">{result.courseTitle}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Instructor: <span className="text-slate-200 font-semibold">{result.instructorName}</span> • Distinction:{' '}
                <span className="text-amber-300 font-semibold">{result.honorLevel} ({result.gradePercent}%)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
