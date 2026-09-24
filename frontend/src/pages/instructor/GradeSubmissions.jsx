import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  ClipboardCheck,
  CheckCircle,
  Clock,
  ExternalLink,
  Star,
  User,
  BookOpen,
  Send,
  X
} from 'lucide-react';

export const GradeSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [gradeInput, setGradeInput] = useState(95);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await API.get('/assignments/instructor/submissions');
      if (res.data.success) {
        setSubmissions(res.data.submissions);
      }
    } catch (err) {
      console.error('Failed to load instructor submissions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGradeModal = (sub) => {
    setSelectedSub(sub);
    setGradeInput(sub.grade !== null && sub.grade !== undefined ? sub.grade : 90);
    setFeedbackInput(sub.feedback || 'Great work! Clean implementation and robust error handling.');
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setSubmitting(true);
    try {
      const res = await API.put(`/assignments/submissions/${selectedSub._id}/grade`, {
        grade: Number(gradeInput),
        feedback: feedbackInput
      });
      if (res.data.success) {
        setSubmissions(submissions.map(s => s._id === selectedSub._id ? res.data.submission : s));
        setSelectedSub(null);
      }
    } catch (err) {
      console.error('Error grading submission', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Assignment Grading Queue</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review student project repositories, evaluate code architecture, and provide personalized feedback.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 glass-panel rounded-2xl animate-pulse"></div>)}
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl space-y-4">
          <ClipboardCheck className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">All Caught Up!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are no pending assignment submissions waiting for grading at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub._id}
              className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                <img
                  src={sub.studentId?.profilePicture || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80'}
                  alt={sub.studentId?.fullName}
                  className="w-12 h-12 rounded-full object-cover border border-slate-700"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{sub.studentId?.fullName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      sub.status === 'graded'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {sub.status === 'graded' ? `Graded: ${sub.grade}/100` : 'Pending Review'}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-indigo-300">
                    {sub.assignmentId?.title || 'Course Project'}
                  </h4>

                  <p className="text-[11px] text-slate-400">
                    Course: <span className="text-slate-300 font-medium">{sub.courseId?.title}</span> • Submitted:{' '}
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                {sub.projectUrl && (
                  <a
                    href={sub.projectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs flex items-center gap-1.5 border border-slate-800"
                  >
                    <ExternalLink className="w-4 h-4 text-purple-400" />
                    <span>View Repository</span>
                  </a>
                )}
                <button
                  onClick={() => handleOpenGradeModal(sub)}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/30"
                >
                  {sub.status === 'graded' ? 'Update Grade' : 'Evaluate Submission'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grading Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 border border-purple-500/30 space-y-5">
            <button
              onClick={() => setSelectedSub(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                Student Evaluation
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Grade: {selectedSub.studentId?.fullName}
              </h3>
              <p className="text-xs text-slate-400">{selectedSub.assignmentId?.title}</p>
            </div>

            {/* Submission Content */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-xs space-y-2">
              <div className="text-slate-400 font-semibold">Student Notes & Solution:</div>
              <p className="text-slate-200">{selectedSub.notes || selectedSub.content || 'No text note provided.'}</p>
              {selectedSub.projectUrl && (
                <div className="pt-2">
                  <a
                    href={selectedSub.projectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {selectedSub.projectUrl}
                  </a>
                </div>
              )}
            </div>

            {/* Grade input form */}
            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Grade Score (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Written Instructor Feedback</label>
                <textarea
                  rows={3}
                  required
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Provide constructive feedback and encouragement..."
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30"
                >
                  {submitting ? 'Submitting...' : 'Save & Publish Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
