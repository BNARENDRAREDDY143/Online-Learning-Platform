import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './RoleBadge';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Shield,
  LayoutDashboard,
  Award,
  PlusCircle,
  ClipboardCheck,
  BarChart3,
  Users,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Search,
  CheckCircle2
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, demoLogin, isAuthenticated, isStudent, isInstructor, isAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDemoSwitch = async (role) => {
    setDemoLoading(true);
    try {
      await demoLogin(role);
      setDropdownOpen(false);
      setMobileMenuOpen(false);
      if (role === 'student') navigate('/student/dashboard');
      else if (role === 'instructor') navigate('/instructor/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
    } catch (err) {
      console.error('Demo switch failed', err);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      {/* Top Demo Bar for Easy Testing */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-slate-950 border-b border-indigo-900/30 px-4 py-1.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-200">Instant Demo Quick-Switch:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDemoSwitch('student')}
            disabled={demoLoading}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              user?.role === 'student'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            🎓 Demo Student
          </button>
          <button
            onClick={() => handleDemoSwitch('instructor')}
            disabled={demoLoading}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              user?.role === 'instructor'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            👨‍🏫 Demo Instructor
          </button>
          <button
            onClick={() => handleDemoSwitch('admin')}
            disabled={demoLoading}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              user?.role === 'admin'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            ⚡ Demo Admin
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                LearnPulse
              </span>
              <span className="block text-[10px] font-semibold text-indigo-400 tracking-wider uppercase">
                Academy
              </span>
            </div>
          </Link>

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/courses"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/courses')
                  ? 'bg-slate-800 text-indigo-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Explore Courses
            </Link>
            <Link
              to="/verify"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/verify')
                  ? 'bg-slate-800 text-indigo-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Verify Certificate
            </Link>

            {/* Authenticated Links based on role */}
            {isAuthenticated && isStudent && (
              <>
                <Link
                  to="/student/dashboard"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/student/dashboard')
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/student/my-learning"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/student/my-learning')
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  My Courses
                </Link>
                <Link
                  to="/student/certificates"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/student/certificates')
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Certificates
                </Link>
              </>
            )}

            {isAuthenticated && isInstructor && (
              <>
                <Link
                  to="/instructor/dashboard"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/instructor/dashboard')
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Instructor Studio
                </Link>
                <Link
                  to="/instructor/courses"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/instructor/courses')
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  My Courses
                </Link>
                <Link
                  to="/instructor/grading"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/instructor/grading')
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Grade Submissions
                </Link>
              </>
            )}

            {isAuthenticated && isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/admin/dashboard')
                      ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Admin Console
                </Link>
                <Link
                  to="/admin/users"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/admin/users')
                      ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  User Management
                </Link>
              </>
            )}
          </nav>

          {/* Right Area: Auth controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-full glass-card hover:border-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <img
                    src={user.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700"
                  />
                  <div className="text-left leading-tight hidden lg:block">
                    <span className="block text-xs font-semibold text-slate-200">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {user.role}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 glass-dropdown rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-sm font-bold text-white">{user.fullName}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      <div className="mt-2">
                        <RoleBadge role={user.role} />
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-indigo-400" />
                      My Profile
                    </Link>

                    {isStudent && (
                      <Link
                        to="/student/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                        Student Dashboard
                      </Link>
                    )}

                    {isInstructor && (
                      <Link
                        to="/instructor/courses/new"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition-colors"
                      >
                        <PlusCircle className="w-4 h-4 text-purple-400" />
                        Create New Course
                      </Link>
                    )}

                    <div className="border-t border-slate-800/80 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white"
          >
            Explore Courses
          </Link>
          <Link
            to="/verify"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white"
          >
            Verify Certificate
          </Link>

          {isAuthenticated ? (
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="px-3 py-2">
                <p className="font-semibold text-white">{user.fullName}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
                <div className="mt-1"><RoleBadge role={user.role} /></div>
              </div>
              {isStudent && (
                <>
                  <Link to="/student/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-slate-300">Dashboard</Link>
                  <Link to="/student/my-learning" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-slate-300">My Learning</Link>
                  <Link to="/student/certificates" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-slate-300">My Certificates</Link>
                </>
              )}
              {isInstructor && (
                <>
                  <Link to="/instructor/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-slate-300">Instructor Studio</Link>
                  <Link to="/instructor/courses" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-slate-300">Manage Courses</Link>
                  <Link to="/instructor/grading" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-slate-300">Grade Submissions</Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-slate-300">Admin Dashboard</Link>
                  <Link to="/admin/users" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-slate-300">User Management</Link>
                </>
              )}
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-rose-400">Sign Out</button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2 text-sm text-slate-300 bg-slate-800 rounded-xl">Log In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2 text-sm text-white bg-indigo-600 rounded-xl font-medium">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
