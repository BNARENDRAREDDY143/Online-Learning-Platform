import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { CourseCard } from '../components/CourseCard';
import {
  Search, Filter, BookOpen, X, Sparkles, Wand2,
  Zap, CheckCircle2, ArrowRight, Brain, Loader2, AlertCircle
} from 'lucide-react';

// ── Animated AI generation steps ──────────────────────────────
const AI_STEPS = [
  { icon: Brain,       label: 'Analyzing your topic...' },
  { icon: Sparkles,    label: 'Generating course structure...' },
  { icon: BookOpen,    label: 'Writing lesson content...' },
  { icon: Zap,         label: 'Creating quizzes & assignments...' },
  { icon: CheckCircle2,label: 'Finalizing and publishing...' },
];

const AIGeneratePanel = ({ searchTerm, onSuccess }) => {
  const [status, setStatus]       = useState('idle');  // idle | generating | done | error
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMsg, setErrorMsg]   = useState('');
  const [generatedCourse, setGeneratedCourse] = useState(null);
  const navigate                  = useNavigate();
  const intervalRef               = useRef(null);

  const startGeneration = async () => {
    setStatus('generating');
    setStepIndex(0);
    setErrorMsg('');

    // Animate through steps
    let step = 0;
    intervalRef.current = setInterval(() => {
      step += 1;
      if (step < AI_STEPS.length - 1) {
        setStepIndex(step);
      }
    }, 1400);

    try {
      const res = await API.post('/ai/generate-course', { topic: searchTerm });
      clearInterval(intervalRef.current);

      if (res.data.success) {
        setStepIndex(AI_STEPS.length - 1);
        setGeneratedCourse(res.data.course);
        setStatus('done');
        // Notify parent to refresh catalog
        setTimeout(() => onSuccess(res.data.course), 800);
      }
    } catch (err) {
      clearInterval(intervalRef.current);
      setErrorMsg(err.response?.data?.message || 'Course generation failed. Please try again.');
      setStatus('error');
    }
  };

  const CurrentStepIcon = AI_STEPS[stepIndex]?.icon || Sparkles;

  return (
    <div className="relative glass-panel rounded-3xl border border-slate-800 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 via-slate-950 to-purple-950/40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10 py-16 px-6 text-center max-w-xl mx-auto space-y-6">

        {/* Idle State */}
        {status === 'idle' && (
          <>
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 animate-pulse opacity-30 blur-xl" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-600/40">
                <Wand2 className="w-9 h-9 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[11px] font-semibold">
                <Sparkles className="w-3 h-3" />
                AI-Powered Course Generator
              </div>
              <h3 className="text-2xl font-black text-white">
                No courses found for{' '}
                <span className="text-gradient">"{searchTerm}"</span>
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                We don't have a course on that yet — but our AI can build one for you <em>right now</em>.
                A complete course with sections, video lessons, quizzes, and assignments — generated in seconds.
              </p>
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['4 Sections', '12+ Lessons', 'Quizzes', 'Free Enrollment'].map((feat) => (
                <span key={feat} className="px-3 py-1 rounded-full glass-card text-[11px] font-semibold text-indigo-300 border border-indigo-500/20">
                  ✓ {feat}
                </span>
              ))}
            </div>

            <button
              onClick={startGeneration}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-2xl shadow-indigo-600/40 transition-all hover:scale-[1.04] active:scale-[0.98] group"
            >
              <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Generate "{searchTerm}" Course with AI
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-[10px] text-slate-500">
              Powered by Google Gemini AI • Course saved to catalog instantly
            </p>
          </>
        )}

        {/* Generating State */}
        {status === 'generating' && (
          <>
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-600/40">
                <CurrentStepIcon className="w-9 h-9 text-white animate-pulse" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Building Your Course…</h3>
              <p className="text-sm text-indigo-300 font-semibold animate-pulse">
                {AI_STEPS[stepIndex]?.label}
              </p>
            </div>

            {/* Progress steps */}
            <div className="space-y-2 text-left max-w-xs mx-auto">
              {AI_STEPS.slice(0, -1).map((step, i) => {
                const Icon = step.icon;
                const done = i < stepIndex;
                const active = i === stepIndex;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                      active
                        ? 'bg-indigo-600/20 border border-indigo-500/30'
                        : done
                        ? 'opacity-50'
                        : 'opacity-25'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : active ? (
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                    ) : (
                      <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span className={`text-xs font-medium ${active ? 'text-indigo-300' : done ? 'text-slate-400' : 'text-slate-600'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Done State */}
        {status === 'done' && generatedCourse && (
          <>
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-2xl bg-emerald-500/30 blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/40">
                <CheckCircle2 className="w-9 h-9 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Course Created! 🎉</h3>
              <p className="text-sm text-slate-400">
                <span className="text-emerald-400 font-semibold">{generatedCourse.title}</span> is now live in the catalog.
              </p>
            </div>
            <button
              onClick={() => navigate(`/courses/${generatedCourse._id}`)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all hover:scale-[1.03]"
            >
              View Generated Course <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Error State */}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Generation Failed</h3>
              <p className="text-xs text-rose-400">{errorMsg}</p>
              <p className="text-xs text-slate-500">You may need to add a GEMINI_API_KEY to backend/.env or check your connection.</p>
            </div>
            <button
              onClick={() => setStatus('idle')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ── Main Catalog Component ─────────────────────────────────────
export const CourseCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses]           = useState([]);
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [total, setTotal]               = useState(0);

  const selectedCategory = searchParams.get('category') || 'All';
  const selectedLevel    = searchParams.get('level')    || 'all';
  const selectedPrice    = searchParams.get('price')    || 'all';
  const selectedSort     = searchParams.get('sort')     || 'newest';
  const searchTerm       = searchParams.get('search')   || '';

  const [localSearch, setLocalSearch] = useState(searchTerm);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'All') queryParams.set('category', selectedCategory);
      if (selectedLevel    && selectedLevel    !== 'all') queryParams.set('level', selectedLevel);
      if (selectedPrice    && selectedPrice    !== 'all') queryParams.set('price', selectedPrice);
      if (selectedSort) queryParams.set('sort', selectedSort);
      if (searchTerm)   queryParams.set('search', searchTerm);

      const [coursesRes, catRes] = await Promise.all([
        API.get(`/courses?${queryParams.toString()}`),
        API.get('/admin/categories')
      ]);

      if (coursesRes.data.success) {
        setCourses(coursesRes.data.courses);
        setTotal(coursesRes.data.total);
      }
      if (catRes.data.success) {
        setCategories(catRes.data.categories);
      }
    } catch (err) {
      console.error('Failed to load catalog', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [selectedCategory, selectedLevel, selectedPrice, selectedSort, searchTerm]);

  const updateFilter = (key, val) => {
    const newParams = new URLSearchParams(searchParams);
    if (val === 'all' || val === 'All' || !val) {
      newParams.delete(key);
    } else {
      newParams.set(key, val);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('search', localSearch);
  };

  // After AI generates a course, refresh catalog and navigate
  const handleAISuccess = (newCourse) => {
    fetchCatalog();  // re-fetch so the new course shows in grid
  };

  // Show AI panel only when there's a search term and 0 results
  const showAIPanel = !loading && courses.length === 0 && searchTerm.trim().length > 0;
  // Show generic empty state when filters active but no search
  const showEmptyState = !loading && courses.length === 0 && !showAIPanel;

  return (
    <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Explore Courses & Video Masterclasses</h1>
          <p className="text-xs text-slate-400 mt-1">
            {loading ? 'Loading catalog...' : `Discover ${total} interactive courses or search any topic to generate a full video course.`}
          </p>
        </div>

        {/* Search & Video Generator Form */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80 group">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search or enter any skill topic..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => { setLocalSearch(''); updateFilter('search', ''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {localSearch.trim() && (
            <button
              onClick={() => {
                updateFilter('search', localSearch);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 whitespace-nowrap transition-all"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Generate Video Course
            </button>
          )}
        </div>
      </div>




      {/* Secondary Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-400" /> Filters:
          </span>
          <select
            value={selectedLevel}
            onChange={(e) => updateFilter('level', e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select
            value={selectedPrice}
            onChange={(e) => updateFilter('price', e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Prices</option>
            <option value="free">Free Courses</option>
            <option value="paid">Paid Courses</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Sort By:</span>
          <select
            value={selectedSort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="newest">Newest Releases</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Courses Grid / States */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : showAIPanel ? (
        <AIGeneratePanel searchTerm={searchTerm} onSuccess={handleAISuccess} />
      ) : showEmptyState ? (
        <div className="text-center py-16 glass-panel rounded-3xl space-y-4">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No matching courses found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your filters or use the search bar to generate a new course with AI.
          </p>
          <button
            onClick={() => setSearchParams({})}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          {/* AI-generated course badge on top when mixed */}
          {courses.some(c => c.isAIGenerated) && (
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Some courses in this list were dynamically generated by AI
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="relative">
                {course.isAIGenerated && (
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-600/90 backdrop-blur text-white text-[10px] font-bold shadow-lg">
                    <Sparkles className="w-2.5 h-2.5" /> AI Generated
                  </div>
                )}
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
