import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CourseCard } from '../../components/CourseCard';
import {
  BookOpen,
  Flame,
  Award,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Play
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [inProgressCourses, setInProgressCourses] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, catalogRes] = await Promise.all([
          API.get('/admin/student-stats'),
          API.get('/courses?limit=3')
        ]);
        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
          setInProgressCourses(statsRes.data.inProgressCourses || []);
        }
        if (catalogRes.data.success) {
          setRecommended(catalogRes.data.courses);
        }
      } catch (err) {
        console.error('Failed to load student dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner with Streak & Hours */}
      <div className="relative glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-purple-950/30 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Student Learning Hub
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              You're making steady progress. Keep your daily streak going and finish your active modules!
            </p>
          </div>

          {/* Streak & Hours Badge Counter */}
          <div className="flex items-center gap-4">
            <div className="glass-card p-4 rounded-2xl flex items-center gap-3 border border-amber-500/30 bg-amber-500/5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <Flame className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-2xl font-black text-white">{stats?.streakDays || 7}</span>
                <span className="block text-[11px] font-semibold text-amber-300 uppercase tracking-wider">Day Streak</span>
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl flex items-center gap-3 border border-indigo-500/30 bg-indigo-500/5">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-white">{stats?.hoursLearned || 4.2}h</span>
                <span className="block text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">Time Learned</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Enrolled Courses</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats?.totalEnrolled || 0}</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>In Progress</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats?.inProgressCount || 0}</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats?.completedCount || 0}</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Certificates Earned</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats?.certificatesCount || 0}</div>
        </div>
      </div>

      {/* Continuing Learning Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Continue Learning</h2>
            <p className="text-xs text-slate-400">Pick up right where you left off.</p>
          </div>
          <Link
            to="/student/my-learning"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            All Enrolled Courses <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {inProgressCourses.length === 0 ? (
          <div className="glass-panel p-8 rounded-3xl text-center border border-slate-800 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No active courses in progress</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Explore our masterclass catalog and start learning high-demand tech skills today!
            </p>
            <Link
              to="/courses"
              className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inProgressCourses.map((enr) => (
              <div key={enr._id} className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-4 items-center">
                <img
                  src={enr.courseId?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'}
                  alt={enr.courseId?.title}
                  className="w-full sm:w-36 aspect-video sm:aspect-square rounded-xl object-cover"
                />
                <div className="flex-1 space-y-3 w-full">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    {enr.courseId?.category}
                  </span>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{enr.courseId?.title}</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Progress</span>
                      <span className="font-semibold text-white">{enr.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${enr.progressPercent}%` }}></div>
                    </div>
                  </div>
                  <Link
                    to={`/learn/${enr.courseId?._id}`}
                    className="inline-flex items-center gap-1.5 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-md shadow-indigo-600/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Resume Lesson
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Courses */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Recommended For You</h2>
            <p className="text-xs text-slate-400">Broaden your skill portfolio with trending topics.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommended.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
};
