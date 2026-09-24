import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  DollarSign,
  Users,
  BookOpen,
  Star,
  PlusCircle,
  ClipboardCheck,
  BarChart3,
  ArrowRight,
  Sparkles,
  Clock
} from 'lucide-react';

export const InstructorDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get('/courses/instructor/analytics');
        if (res.data.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error('Failed to load instructor analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const stats = analytics?.stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-slate-900 via-purple-950/30 to-indigo-950/20 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-semibold border border-purple-500/20">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Instructor Management Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {user?.firstName} {user?.lastName}! 👨‍🏫
          </h1>
          <p className="text-xs text-slate-300">
            Monitor course performance, review student submissions, and build new masterclasses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/instructor/courses/new"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            Create Course
          </Link>
          <Link
            to="/instructor/grading"
            className="px-4 py-2.5 glass-card text-xs font-semibold text-slate-200 hover:text-white rounded-xl border border-slate-700 flex items-center gap-1.5"
          >
            <ClipboardCheck className="w-4 h-4 text-purple-400" />
            Grading Queue
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ${(stats?.totalRevenue || 0).toLocaleString()}
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Students</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats?.totalStudents || 0}</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Student Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats?.avgRating || '4.9'}★</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Completion Rate</span>
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats?.completionRate || 0}%</div>
        </div>
      </div>

      {/* Your Courses List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Your Courses</h2>
            <p className="text-xs text-slate-400">Manage curriculum, lectures, quizzes and pricing.</p>
          </div>
          <Link
            to="/instructor/courses"
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Manage All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analytics?.courses?.map((course) => (
            <div key={course._id} className="glass-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between">
              <div>
                <img src={course.thumbnail} alt={course.title} className="w-full aspect-video object-cover" />
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/20">
                      {course.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${
                      course.status === 'published' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      ● {course.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white line-clamp-2">{course.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>{course.enrollmentCount || 0} Students</span>
                    <span>${course.price}</span>
                    <span>{course.sections?.length || 0} Sections</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex gap-2">
                <Link
                  to={`/instructor/courses/edit/${course._id}`}
                  className="flex-1 py-2 bg-slate-800 hover:bg-purple-600 text-white rounded-xl text-xs font-semibold text-center transition-colors"
                >
                  Edit Curriculum
                </Link>
                <Link
                  to={`/learn/${course._id}`}
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Preview
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
