import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { CertificateModal } from '../../components/CertificateModal';
import { Award, ExternalLink, Download, CheckCircle, ShieldCheck } from 'lucide-react';

export const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await API.get('/certificates/my-certificates');
        if (res.data.success) {
          setCertificates(res.data.certificates);
        }
      } catch (err) {
        console.error('Failed to load certificates', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Earned Certificates</h1>
        <p className="text-xs text-slate-400 mt-1">
          Download, print, or share your officially verified academic certificates.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 glass-panel rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl space-y-4 max-w-lg mx-auto">
          <Award className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No certificates earned yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Complete all modules, quizzes, and project assignments in an enrolled course to unlock your verified credential.
          </p>
          <Link
            to="/student/my-learning"
            className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
          >
            Go to My Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-[10px] text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                    {cert.certificateNumber}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified Credential
                  </span>
                  <h3 className="text-base font-bold text-white mt-1 line-clamp-2">
                    {cert.courseTitle}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Awarded to <span className="text-slate-200 font-semibold">{cert.studentName}</span>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex gap-2">
                <button
                  onClick={() => setSelectedCert(cert)}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Award className="w-3.5 h-3.5" />
                  View & Print
                </button>
                <Link
                  to={`/verify?id=${cert.certificateNumber}`}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
                  title="Public Verification Link"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  );
};
