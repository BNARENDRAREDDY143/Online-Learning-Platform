import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { CourseCard } from '../../components/CourseCard';
import { CertificateModal } from '../../components/CertificateModal';
import { BookOpen, CheckCircle, Clock, Award, ArrowRight } from 'lucide-react';

export const MyLearning = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await API.get('/courses/my-learning');
        if (res.data.success) {
          setEnrollments(res.data.enrollments);
        }
      } catch (err) {
        console.error('Failed to load enrolled courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const filteredEnrollments = enrollments.filter(e => {
    if (activeTab === 'in_progress') return e.status !== 'completed' && e.progressPercent < 100;
    if (activeTab === 'completed') return e.status === 'completed' || e.progressPercent === 100;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">My Courses</h1>
        <p className="text-xs text-slate-400 mt-1">Manage your active enrollments and certificates.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          All Enrolled ({enrollments.length})
        </button>
        <button
          onClick={() => setActiveTab('in_progress')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'in_progress'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          In Progress ({enrollments.filter(e => e.progressPercent < 100).length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'completed'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Completed ({enrollments.filter(e => e.progressPercent === 100).length})
        </button>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 glass-panel rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl space-y-4">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No courses in this section</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Discover cutting-edge engineering and design courses in our course catalog.
          </p>
          <Link
            to="/courses"
            className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((enr) => {
            const course = enr.courseId;
            if (!course) return null;
            const isCompleted = enr.progressPercent === 100 || enr.status === 'completed';

            return (
              <div key={enr._id} className="glass-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="relative aspect-video">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-950/80 text-indigo-300 border border-indigo-500/30">
                        {course.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="text-sm font-bold text-white line-clamp-2">
                      <Link to={`/learn/${course._id}`}>{course.title}</Link>
                    </h3>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Progress</span>
                        <span className="font-semibold text-indigo-400">{enr.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${enr.progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <Link
                    to={`/learn/${course._id}`}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {isCompleted ? 'Review Lectures' : 'Continue Course'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {isCompleted && enr.certificateId && (
                    <button
                      onClick={() => setSelectedCert(enr.certificateId)}
                      className="p-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30 transition-colors"
                      title="View Certificate"
                    >
                      <Award className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
