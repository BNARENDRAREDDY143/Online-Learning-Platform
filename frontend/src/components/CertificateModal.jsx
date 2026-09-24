import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Award, Download, Share2, X, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export const CertificateModal = ({ certificate, onClose }) => {
  const certRef = useRef(null);

  if (!certificate) return null;

  const handleDownloadPDF = async () => {
    if (!certRef.current) return;
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Certificate_${certificate.certificateNumber || 'LearnPulse'}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    }
  };

  const verifyUrl = `${window.location.origin}/verify?id=${certificate.certificateNumber}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-panel rounded-3xl p-6 md:p-8 border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Verified Certificate of Completion</h2>
              <p className="text-xs text-slate-400">ID: {certificate.certificateNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-600/30"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <a
              href={verifyUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border border-slate-700"
            >
              <ExternalLink className="w-4 h-4" />
              Public Verification
            </a>
          </div>
        </div>

        {/* Certificate Printable Canvas Layout */}
        <div
          ref={certRef}
          className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/90 text-white p-8 md:p-12 rounded-2xl border-4 border-double border-amber-500/40 shadow-inner overflow-hidden"
        >
          {/* Subtle Watermark seal */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <Award className="w-96 h-96 text-amber-400" />
          </div>

          {/* Certificate Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20 uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" />
              Official Academic Accreditation
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase font-sans">
              Certificate of Achievement
            </h1>
            <p className="text-xs text-slate-400 font-medium">This is proudly presented to</p>
          </div>

          {/* Student Name */}
          <div className="text-center my-6">
            <h2 className="text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 tracking-wide underline decoration-amber-500/50 decoration-2 underline-offset-8">
              {certificate.studentName}
            </h2>
          </div>

          {/* Course & Description */}
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              for successfully mastering and completing all modules, quizzes, practical assignments, and rigorous assessments for
            </p>
            <h3 className="text-lg md:text-xl font-bold text-indigo-300">
              {certificate.courseTitle}
            </h3>
            <p className="text-xs text-slate-400">
              Awarded with <span className="text-amber-300 font-semibold">{certificate.honorLevel || 'Honors Distinction'}</span> ({certificate.gradePercent || 100}% Final Grade)
            </p>
          </div>

          {/* Footer Signatures & QR Verification */}
          <div className="flex flex-wrap items-end justify-between pt-6 border-t border-slate-800 gap-6">
            <div>
              <div className="text-xs text-slate-400 font-medium">Issued Date:</div>
              <div className="text-sm font-semibold text-slate-200">
                {new Date(certificate.issueDate || Date.now()).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                Cryptographically Verified
              </div>
            </div>

            {/* Instructor Signature Box */}
            <div className="text-center">
              <div className="font-serif italic text-lg text-amber-200 border-b border-slate-600 pb-1 px-4">
                {certificate.instructorName || 'Lead Instructor'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                Instructor & Course Director
              </div>
            </div>

            {/* Verification Code Box */}
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Certificate Number</div>
              <div className="font-mono text-xs font-bold text-amber-300 bg-slate-900/90 px-2.5 py-1 rounded border border-slate-700 inline-block mt-0.5">
                {certificate.certificateNumber}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
