import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { CourseCard } from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  BookOpen,
  Award,
  Users,
  PlayCircle,
  CheckCircle2,
  TrendingUp,
  Shield,
  ArrowRight,
  Code,
  Palette,
  Brain,
  Cloud,
  Smartphone,
  Star,
  Search,
  Wand2,
  Loader2,
  Zap,
  Check
} from 'lucide-react';

export const LandingPage = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTopic, setSearchTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState('');
  const { isAuthenticated, isStudent, isInstructor } = useAuth();
  const navigate = useNavigate();

  const QUICK_TOPICS = [
    'React Full-Stack',
    'Python & AI',
    'Docker & Kubernetes',
    'Data Structures & Algorithms',
    'Cybersecurity',
    'Java Spring Boot',
    'UI/UX Design in Figma',
    'Flutter Mobile Apps'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, catRes] = await Promise.all([
          API.get('/courses?limit=6'),
          API.get('/admin/categories')
        ]);
        if (coursesRes.data.success) {
          setFeaturedCourses(coursesRes.data.courses);
        }
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
      } catch (err) {
        console.error('Failed to load landing data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchOrGenerate = async (e, directTopic) => {
    if (e) e.preventDefault();
    const query = (directTopic || searchTopic).trim();
    if (!query) return;

    // Check if query exists or initiate instant generation
    setGenerating(true);
    setGenMessage(`Searching or building HD video course for "${query}"...`);

    try {
      const res = await API.post('/ai/generate-course', { topic: query });
      if (res.data.success && res.data.course?._id) {
        setGenMessage('Course & Video lectures ready! Opening...');
        setTimeout(() => {
          navigate(`/courses/${res.data.course._id}`);
        }, 600);
      } else {
        navigate(`/courses?search=${encodeURIComponent(query)}`);
      }
    } catch (err) {
      console.warn('AI generation fallback to catalog search', err);
      navigate(`/courses?search=${encodeURIComponent(query)}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-24 pb-20 w-full">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col justify-center pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl 2xl:max-w-[1600px] mx-auto overflow-hidden">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-indigo-600/20 blur-[140px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[300px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative text-center space-y-8 max-w-4xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-lg shadow-indigo-950/40">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Empowering the Next Generation of Builders • Instant AI Video Courses
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
            Master High-Demand Skills with{' '}
            <span className="text-gradient">Interactive Precision</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Search any topic to dynamically generate full courses with HD video lectures, interactive quizzes, assignments, and verifiable certificates.
          </p>

          {/* Interactive Search & Video Course Generator Bar */}
          <div className="max-w-2xl mx-auto w-full">
            <form
              onSubmit={handleSearchOrGenerate}
              className="relative glass-panel p-2 rounded-2xl border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Type ANY skill (e.g. React, Python AI, Docker, Java, DSA)..."
                  value={searchTopic}
                  onChange={(e) => setSearchTopic(e.target.value)}
                  disabled={generating}
                  className="w-full pl-12 pr-4 py-3 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={generating || !searchTopic.trim()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shrink-0"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Video Course...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate Video Course
                  </>
                )}
              </button>
            </form>

            {/* Live Progress Feedback */}
            {generating && (
              <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-indigo-300 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                {genMessage}
              </div>
            )}

            {/* Quick Topic Badges */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Popular Topics:</span>
              {QUICK_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => {
                    setSearchTopic(topic);
                    handleSearchOrGenerate(null, topic);
                  }}
                  className="px-2.5 py-1 rounded-lg glass-card text-[11px] font-medium text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-600/10 transition-all flex items-center gap-1"
                >
                  <Zap className="w-2.5 h-2.5 text-indigo-400" />
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/courses"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 transition-all hover:scale-[1.03]"
            >
              <BookOpen className="w-4 h-4" />
              Explore All Courses
              <ArrowRight className="w-4 h-4" />
            </Link>

            {isAuthenticated ? (
              <Link
                to={isStudent ? '/student/dashboard' : isInstructor ? '/instructor/dashboard' : '/admin/dashboard'}
                className="px-7 py-3.5 rounded-2xl glass-card text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 hover:border-indigo-500 flex items-center gap-2"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/register"
                className="px-7 py-3.5 rounded-2xl glass-card text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 hover:border-indigo-500 flex items-center gap-2"
              >
                Create Free Account
              </Link>
            )}
          </div>

          {/* Key Metrics / Highlights */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="glass-panel p-4 rounded-2xl text-center">
              <div className="text-2xl font-black text-white">50k+</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Active Learners</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl text-center">
              <div className="text-2xl font-black text-indigo-400">120+</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">HD Video Courses</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl text-center">
              <div className="text-2xl font-black text-purple-400">98%</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Completion Rating</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl text-center">
              <div className="text-2xl font-black text-emerald-400">100%</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Verified Certs</div>
            </div>
          </div>
        </div>
      </section>


      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">Categories</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Browse by Discipline</h2>
          </div>
          <Link
            to="/courses"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            View all categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/courses?category=${encodeURIComponent(cat.name)}`}
              className="glass-card p-5 rounded-2xl flex flex-col items-center text-center group hover:border-indigo-500/50"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform mb-3">
                <Code className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">Curated Catalog</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Featured Masterclasses</h2>
            <p className="text-xs text-slate-400 mt-1">Handpicked courses crafted by senior industry professionals.</p>
          </div>
          <Link
            to="/courses"
            className="px-4 py-2 rounded-xl glass-card text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 hover:border-indigo-500"
          >
            Explore All Courses
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 glass-panel rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose LearnPulse Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-950 to-indigo-950/30">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">The Learning Edge</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              Engineered for Deep Retention
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Traditional passive video watching doesn't build real-world mastery. We built an active learning ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <PlayCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Interactive Video & Articles</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamlessly toggle between HD video lectures, formatted code blocks, and downloadable resources in a distraction-free player.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Timed Quizzes & Real Assignments</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Test concepts with instant question evaluations and receive tailored feedback and grades on practical project submissions.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Verifiable Digital Certificates</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Earn cryptographic certificates with unique verification IDs and QR codes ready to share on LinkedIn or with hiring managers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Student Stories</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Loved by 50,000+ Learners</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "The MERN Masterclass course gave me the exact confidence I needed for my senior tech interviews. The quizzes and assignment feedback were super helpful!"
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
              <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80" alt="Alex" className="w-9 h-9 rounded-full object-cover" />
              <div>
                <h4 className="text-xs font-bold text-white">Alex Rivera</h4>
                <p className="text-[10px] text-slate-400">Full Stack Developer</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "The UI/UX design tokens and Figma auto-layout modules are gold standard. Downloaded my certificate and added it straight to my portfolio."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" alt="Emma" className="w-9 h-9 rounded-full object-cover" />
              <div>
                <h4 className="text-xs font-bold text-white">Emma Watson</h4>
                <p className="text-[10px] text-slate-400">Product Designer</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "As an instructor, the course builder and grading queue workflow is the smoothest I have ever used. Creating quizzes and modules takes minutes."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" alt="Sarah" className="w-9 h-9 rounded-full object-cover" />
              <div>
                <h4 className="text-xs font-bold text-white">Sarah Jenkins</h4>
                <p className="text-[10px] text-slate-400">Lead Course Instructor</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
