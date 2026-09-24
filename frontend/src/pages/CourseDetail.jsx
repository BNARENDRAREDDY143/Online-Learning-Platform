import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RatingStars } from '../components/RatingStars';
import {
  Clock,
  BookOpen,
  Award,
  Users,
  PlayCircle,
  FileText,
  HelpCircle,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lock
} from 'lucide-react';

export const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [openSections, setOpenSections] = useState({ 0: true });
  const [previewVideo, setPreviewVideo] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await API.get(`/courses/${id}`);
        if (res.data.success) {
          setCourse(res.data.course);
        }
      } catch (err) {
        console.error('Failed to load course details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const toggleSection = (index) => {
    setOpenSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setEnrolling(true);
    try {
      const res = await API.post(`/courses/${course._id}/enroll`);
      if (res.data.success) {
        navigate(`/learn/${course._id}`);
      }
    } catch (err) {
      console.error('Enrollment error', err);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-slate-400">Loading course curriculum...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center glass-panel rounded-3xl space-y-4">
        <h2 className="text-2xl font-bold text-white">Course Not Found</h2>
        <p className="text-xs text-slate-400">The requested course could not be located or has been archived.</p>
        <Link to="/courses" className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Browse All Courses
        </Link>
      </div>
    );
  }

  const isFree = course.price === 0;
  const discountedPrice = course.discount > 0 ? (course.price * (1 - course.discount / 100)).toFixed(2) : course.price;
  const totalLessons = course.sections?.reduce((sum, sec) => sum + (sec.lessons?.length || 0), 0) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Top Banner / Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {course.category}
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-900 text-slate-300 border border-slate-800 capitalize">
              {course.level?.replace('_', ' ')}
            </span>
            {course.isFeatured && (
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                ⭐ Featured Course
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {course.title}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            {course.subtitle || course.description?.replace(/<[^>]*>?/gm, '')}
          </p>

          {/* Rating, Students, Duration */}
          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300">
            <RatingStars rating={course.rating || 4.9} reviewsCount={course.reviewCount || 48} size="md" />
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" />
              {course.enrollmentCount || 0} enrolled students
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              {course.durationHours || 12} total hours
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              Certificate Included
            </span>
          </div>

          {/* Instructor Card Preview */}
          <div className="flex items-center gap-4 p-4 glass-card rounded-2xl border border-slate-800">
            <img
              src={course.instructorId?.profilePicture || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'}
              alt={course.instructorId?.fullName}
              className="w-12 h-12 rounded-xl object-cover border border-slate-700"
            />
            <div>
              <p className="text-xs text-slate-400 font-medium">Created by</p>
              <h3 className="text-sm font-bold text-white">
                {course.instructorId?.firstName} {course.instructorId?.lastName}
              </h3>
              <p className="text-[11px] text-indigo-300">{course.instructorId?.title || 'Senior Technical Instructor'}</p>
            </div>
          </div>
        </div>

        {/* Right Sticky Enrollment Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 glass-panel rounded-3xl p-6 border border-slate-800 space-y-6 shadow-2xl">
            {/* Thumbnail with Video Play Overlay */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 group">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              {course.previewVideoUrl && (
                <button
                  onClick={() => setPreviewVideo(course.previewVideoUrl)}
                  className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center group-hover:bg-slate-950/20 transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-8 h-8" />
                  </div>
                </button>
              )}
            </div>

            {/* Price section */}
            <div className="space-y-1">
              {isFree ? (
                <div className="text-2xl font-black text-emerald-400 uppercase tracking-tight">
                  Free Course
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">${discountedPrice}</span>
                  {course.discount > 0 && (
                    <>
                      <span className="text-sm text-slate-500 line-through">${course.price}</span>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        {course.discount}% OFF
                      </span>
                    </>
                  )}
                </div>
              )}
              <p className="text-[11px] text-slate-400">Full lifetime access & verified certificate</p>
            </div>

            {/* Enroll CTA */}
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              {enrolling ? (
                'Processing...'
              ) : isFree ? (
                <>Enroll For Free <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Enroll Now - Start Learning <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            {/* Highlights */}
            <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{totalLessons} on-demand video & article lessons</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Interactive knowledge checks & quizzes</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real-world hands-on project assignments</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Official verifiable completion certificate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Curriculum & Syllabus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
        <div className="lg:col-span-2 space-y-8">
          {/* Objectives */}
          {course.objectives?.length > 0 && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                What You Will Learn
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.objectives.map((obj, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curriculum Accordion */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Course Curriculum</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {course.sections?.length || 0} Modules • {totalLessons} Lessons
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {course.sections?.map((section, sIdx) => {
                const isOpen = !!openSections[sIdx];
                return (
                  <div key={section._id} className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
                    <button
                      onClick={() => toggleSection(sIdx)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-800/40 transition-colors"
                    >
                      <div>
                        <h3 className="text-sm font-bold text-white">{section.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {section.lessons?.length || 0} lessons {section.quizId && '• 1 Quiz'} {section.assignmentId && '• 1 Assignment'}
                        </p>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>

                    {isOpen && (
                      <div className="p-4 pt-0 border-t border-slate-800/60 divide-y divide-slate-800/40">
                        {section.lessons?.map((lesson) => (
                          <div key={lesson._id} className="py-2.5 flex items-center justify-between text-xs text-slate-300">
                            <div className="flex items-center gap-2.5">
                              {lesson.type === 'video' ? (
                                <PlayCircle className="w-4 h-4 text-indigo-400" />
                              ) : (
                                <FileText className="w-4 h-4 text-purple-400" />
                              )}
                              <span>{lesson.title}</span>
                              {lesson.isFreePreview && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Free Preview
                                </span>
                              )}
                            </div>
                            <span className="text-slate-400">{lesson.durationMinutes || 10} min</span>
                          </div>
                        ))}

                        {section.quizId && (
                          <div className="py-2.5 flex items-center justify-between text-xs text-amber-300">
                            <div className="flex items-center gap-2.5">
                              <HelpCircle className="w-4 h-4 text-amber-400" />
                              <span>Assessment: {section.quizId.title || 'Module Quiz'}</span>
                            </div>
                            <span className="text-slate-400">Knowledge Check</span>
                          </div>
                        )}

                        {section.assignmentId && (
                          <div className="py-2.5 flex items-center justify-between text-xs text-purple-300">
                            <div className="flex items-center gap-2.5">
                              <FileText className="w-4 h-4 text-purple-400" />
                              <span>Project: {section.assignmentId.title || 'Hands-on Assignment'}</span>
                            </div>
                            <span className="text-slate-400">Graded Work</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-3xl glass-panel rounded-3xl p-6 border border-slate-800">
            <button
              onClick={() => setPreviewVideo(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
            <h3 className="text-base font-bold text-white mb-4">Course Preview Lecture</h3>
            <div className="aspect-video rounded-2xl overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${previewVideo.split('v=')[1] || 'SqcY0GlETPk'}?autoplay=1`}
                title="Preview Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
