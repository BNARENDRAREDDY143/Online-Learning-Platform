import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import {
  Shield,
  Users,
  BookOpen,
  DollarSign,
  Award,
  Layers,
  ArrowRight,
  TrendingUp,
  UserCheck,
  UserX
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await API.get('/admin/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/30 bg-gradient-to-r from-slate-900 via-rose-950/30 to-indigo-950/20 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 text-xs font-semibold border border-rose-500/20">
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            Super Administrator Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Platform System Overview
          </h1>
          <p className="text-xs text-slate-300">
            Supervise platform metrics, user access controls, courses, and accreditation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all"
          >
            <Users className="w-4 h-4" />
            Manage Users
          </Link>
          <Link
            to="/admin/categories"
            className="px-4 py-2.5 glass-card text-xs font-semibold text-slate-200 hover:text-white rounded-xl border border-slate-700 flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-rose-400" />
            Categories
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Platform Users</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats?.totalUsers || 0}</div>
          <p className="text-[10px] text-slate-500">{stats?.studentCount} Students • {stats?.instructorCount} Instructors</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Courses</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats?.totalCourses || 0}</div>
          <p className="text-[10px] text-slate-500">{stats?.publishedCourses} Published</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Enrollments</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats?.totalEnrollments || 0}</div>
          <p className="text-[10px] text-slate-500">Across all catalog topics</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Platform Revenue</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ${(stats?.totalRevenue || 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500">Gross course sales</p>
        </div>
      </div>

      {/* Recent Users & Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-400" />
              Recent User Registrations
            </h3>
            <Link to="/admin/users" className="text-xs text-rose-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentUsers?.map((u) => (
              <div key={u._id} className="p-3 glass-card rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={u.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={u.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{u.fullName}</h4>
                    <p className="text-[10px] text-slate-400">{u.email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded capitalize bg-slate-900 text-slate-300 border border-slate-800">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Courses */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              Recent Courses
            </h3>
            <Link to="/courses" className="text-xs text-purple-400 hover:underline">
              Catalog
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentCourses?.map((c) => (
              <div key={c._id} className="p-3 glass-card rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 truncate pr-2">
                  <img src={c.thumbnail} alt={c.title} className="w-10 h-8 rounded-lg object-cover shrink-0" />
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate">{c.title}</h4>
                    <p className="text-[10px] text-slate-400">{c.category} • ${c.price}</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded text-emerald-400 bg-emerald-500/10 shrink-0">
                  {c.enrollmentCount || 0} enrolled
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
