import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CertificateModal } from '../../components/CertificateModal';
import {
  PlayCircle,
  FileText,
  HelpCircle,
  CheckCircle2,
  Check,
  ChevronDown,
  ChevronUp,
  Award,
  MessageSquare,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Send,
  Sparkles,
  ExternalLink,
  Clock,
  ThumbsUp,
  Download
} from 'lucide-react';

export const LearningRoom = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [activeTab, setActiveTab] = useState('lesson'); // 'lesson', 'quiz', 'assignment', 'discussions', 'notes'
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({ 0: true });

  // Quiz taking state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);

  // Assignment submission state
  const [assignmentForm, setAssignmentForm] = useState({ content: '', projectUrl: '', notes: '' });
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);

  // Discussions state
  const [discussions, setDiscussions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '' });
  const [replyText, setReplyText] = useState({});

  // Personal notes state
  const [notes, setNotes] = useState(localStorage.getItem(`notes_${courseId}`) || '');

  // Theater wide mode
  const [theaterMode, setTheaterMode] = useState(false);

  // Certificate modal
  const [certificate, setCertificate] = useState(null);
  const [generatingCert, setGeneratingCert] = useState(false);

  // Helper to get embeddable video URL from any format
  const getEmbedUrl = (url) => {
    if (!url) return 'https://www.youtube.com/embed/SqcY0GlETPk';
    if (url.includes('youtube.com/embed/')) return url;
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
    }
    if (url.includes('youtube.com/watch')) {
      const id = new URLSearchParams(url.split('?')[1] || '').get('v') || url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id || 'SqcY0GlETPk'}?autoplay=0&rel=0`;
    }
    return url;
  };


  useEffect(() => {
    fetchCourseData();
    fetchDiscussions();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const res = await API.get(`/courses/${courseId}/learn`);
      if (res.data.success) {
        setCourse(res.data.course);
        setEnrollment(res.data.enrollment);

        // Select initial lesson
        const sections = res.data.course.sections || [];
        if (sections.length > 0 && sections[0].lessons?.length > 0) {
          const defaultLesson = sections[0].lessons[0];
          setCurrentLesson(defaultLesson);
        }
      }
    } catch (err) {
      console.error('Error fetching learning room data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussions = async () => {
    try {
      const res = await API.get(`/discussions/course/${courseId}`);
      if (res.data.success) {
        setDiscussions(res.data.discussions);
      }
    } catch (err) {
      console.error('Failed to load discussions', err);
    }
  };

  const toggleSection = (idx) => {
    setOpenSections(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSelectLesson = (lesson) => {
    setCurrentLesson(lesson);
    setCurrentQuiz(null);
    setCurrentAssignment(null);
    setActiveTab('lesson');
  };

  const handleSelectQuiz = async (quiz) => {
    setCurrentQuiz(quiz);
    setCurrentLesson(null);
    setCurrentAssignment(null);
    setActiveTab('quiz');
    setQuizAnswers({});
    setQuizResult(null);

    try {
      const res = await API.get(`/quizzes/${quiz._id}`);
      if (res.data.success && res.data.latestSubmission) {
        setQuizResult(res.data.latestSubmission);
      }
    } catch (err) {
      console.error('Error fetching quiz details', err);
    }
  };

  const handleSelectAssignment = async (assignment) => {
    setCurrentAssignment(assignment);
    setCurrentLesson(null);
    setCurrentQuiz(null);
    setActiveTab('assignment');

    try {
      const res = await API.get(`/assignments/${assignment._id}`);
      if (res.data.success && res.data.submission) {
        setCurrentSubmission(res.data.submission);
        setAssignmentForm({
          content: res.data.submission.content || '',
          projectUrl: res.data.submission.projectUrl || '',
          notes: res.data.submission.notes || ''
        });
      }
    } catch (err) {
      console.error('Error fetching assignment details', err);
    }
  };

  // Mark current lesson as complete
  const handleCompleteLesson = async () => {
    if (!currentLesson) return;
    try {
      const res = await API.post(`/lessons/${currentLesson._id}/complete`);
      if (res.data.success) {
        setEnrollment(prev => ({
          ...prev,
          progressPercent: res.data.progressPercent,
          completedLessons: res.data.completedLessons,
          status: res.data.status
        }));
      }
    } catch (err) {
      console.error('Error marking lesson complete', err);
    }
  };

  // Submit Quiz
  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;
    setQuizSubmitting(true);
    try {
      const answersArray = Object.keys(quizAnswers).map(qId => ({
        questionId: qId,
        selectedAnswer: quizAnswers[qId]
      }));

      const res = await API.post(`/quizzes/${currentQuiz._id}/submit`, {
        answers: answersArray
      });

      if (res.data.success) {
        setQuizResult(res.data.submission);
        fetchCourseData(); // Refresh progress
      }
    } catch (err) {
      console.error('Error submitting quiz', err);
    } finally {
      setQuizSubmitting(false);
    }
  };

  // Submit Assignment
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!currentAssignment) return;
    setAssignmentSubmitting(true);
    try {
      const res = await API.post(`/assignments/${currentAssignment._id}/submit`, assignmentForm);
      if (res.data.success) {
        setCurrentSubmission(res.data.submission);
        alert('Assignment submitted successfully for instructor evaluation!');
      }
    } catch (err) {
      console.error('Error submitting assignment', err);
    } finally {
      setAssignmentSubmitting(false);
    }
  };

  // Post Discussion Question
  const handlePostQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.title.trim()) return;
    try {
      const res = await API.post(`/discussions/course/${courseId}`, newQuestion);
      if (res.data.success) {
        setDiscussions([res.data.discussion, ...discussions]);
        setNewQuestion({ title: '', content: '' });
      }
    } catch (err) {
      console.error('Error posting question', err);
    }
  };

  // Reply to Discussion
  const handleReplyDiscussion = async (discId) => {
    const content = replyText[discId];
    if (!content?.trim()) return;
    try {
      const res = await API.post(`/discussions/${discId}/reply`, { content });
      if (res.data.success) {
        setDiscussions(discussions.map(d => d._id === discId ? res.data.discussion : d));
        setReplyText({ ...replyText, [discId]: '' });
      }
    } catch (err) {
      console.error('Error replying', err);
    }
  };

  // Generate Certificate
  const handleGenerateCertificate = async () => {
    setGeneratingCert(true);
    try {
      const res = await API.post(`/certificates/generate/${courseId}`);
      if (res.data.success) {
        setCertificate(res.data.certificate);
        fetchCourseData();
      }
    } catch (err) {
      console.error('Error generating certificate', err);
    } finally {
      setGeneratingCert(false);
    }
  };

  const handleSaveNotes = (text) => {
    setNotes(text);
    localStorage.setItem(`notes_${courseId}`, text);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isLessonCompleted = (id) => enrollment?.completedLessons?.includes(id);
  const progressPercent = enrollment?.progressPercent || 0;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Learning Bar */}
      <div className="glass-panel border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link
            to="/student/my-learning"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-white line-clamp-1">{course?.title}</h1>
            <p className="text-[11px] text-slate-400">
              Instructor: {course?.instructorId?.firstName} {course?.instructorId?.lastName}
            </p>
          </div>
        </div>

        {/* Progress & Certificate Generator */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-white">{progressPercent}%</span>
          </div>

          {progressPercent >= 100 && (
            <button
              onClick={handleGenerateCertificate}
              disabled={generatingCert}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 animate-pulse"
            >
              <Award className="w-4 h-4" />
              {enrollment?.certificateIssued ? 'View Certificate' : 'Claim Certificate'}
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Sidebar (Curriculum) + Stage (Player/Quiz/Assignment) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Curriculum Sidebar */}
        <aside className="w-full lg:w-80 glass-panel border-r border-slate-800 overflow-y-auto max-h-[88vh]">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Course Outline
            </span>
            <span className="text-xs text-indigo-400 font-semibold">
              {enrollment?.completedLessons?.length || 0} completed
            </span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {course?.sections?.map((section, sIdx) => {
              const isOpen = !!openSections[sIdx];
              return (
                <div key={section._id}>
                  <button
                    onClick={() => toggleSection(sIdx)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-900/60 transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{section.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {section.lessons?.length || 0} Lessons
                      </p>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>

                  {isOpen && (
                    <div className="p-2 space-y-1 bg-slate-950/40">
                      {section.lessons?.map((lesson) => {
                        const isCurrent = currentLesson?._id === lesson._id;
                        const completed = isLessonCompleted(lesson._id);

                        return (
                          <button
                            key={lesson._id}
                            onClick={() => handleSelectLesson(lesson)}
                            className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-all ${
                              isCurrent
                                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                                : 'text-slate-300 hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              {completed ? (
                                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                  <Check className="w-3 h-3" />
                                </div>
                              ) : lesson.type === 'video' ? (
                                <PlayCircle className="w-4 h-4 text-slate-400 shrink-0" />
                              ) : (
                                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              <span className="truncate">{lesson.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 shrink-0">
                              {lesson.durationMinutes || 10}m
                            </span>
                          </button>
                        );
                      })}

                      {/* Quiz Button */}
                      {section.quizId && (
                        <button
                          onClick={() => handleSelectQuiz(section.quizId)}
                          className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-all ${
                            currentQuiz?._id === section.quizId._id
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                              : 'text-amber-400/80 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="truncate">Assessment: {section.quizId.title || 'Quiz'}</span>
                          </div>
                        </button>
                      )}

                      {/* Assignment Button */}
                      {section.assignmentId && (
                        <button
                          onClick={() => handleSelectAssignment(section.assignmentId)}
                          className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-all ${
                            currentAssignment?._id === section.assignmentId._id
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold'
                              : 'text-purple-400/80 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                            <span className="truncate">Project: {section.assignmentId.title || 'Assignment'}</span>
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Stage Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[88vh] space-y-6">
          {/* Navigation Tab Bar */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('lesson')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'lesson'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Lecture Material
            </button>
            <button
              onClick={() => setActiveTab('discussions')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'discussions'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Q&A Discussion ({discussions.length})
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'notes'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              My Notes
            </button>
          </div>

          {/* TAB 1: Lecture Material View */}
          {activeTab === 'lesson' && currentLesson && (
            <div className="space-y-6">
              {/* Video Player or Article Reader */}
              {currentLesson.type === 'video' || (currentLesson.content?.videoUrl || currentLesson.videoUrl) ? (
                <div className="space-y-3">
                  <div className={`relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800 ${
                    theaterMode ? 'aspect-[21/9] sm:aspect-[16/9] max-h-[75vh]' : 'aspect-video'
                  }`}>
                    <iframe
                      src={getEmbedUrl(currentLesson.content?.videoUrl || currentLesson.videoUrl)}
                      title={currentLesson.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <PlayCircle className="w-3.5 h-3.5 text-indigo-400" />
                      HD Video Lecture • Interactive Learning Mode
                    </span>
                    <button
                      onClick={() => setTheaterMode(!theaterMode)}
                      className="text-[11px] text-slate-400 hover:text-indigo-400 font-medium transition-colors flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800"
                    >
                      {theaterMode ? 'Standard View' : 'Theater Wide View'}
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Lecture Notes / Article Body */}
              {(currentLesson.content?.articleBody || currentLesson.description) && (
                <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans prose prose-invert max-w-none">
                  <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    Lecture Blueprint & Notes
                  </h3>
                  <div className="whitespace-pre-line text-slate-300">
                    {currentLesson.content?.articleBody || currentLesson.description}
                  </div>
                </div>
              )}


              {/* Lesson Control Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white">{currentLesson.title}</h2>
                  <p className="text-xs text-slate-400">{currentLesson.description || 'Module lesson material'}</p>
                </div>

                <button
                  onClick={handleCompleteLesson}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isLessonCompleted(currentLesson._id)
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isLessonCompleted(currentLesson._id) ? 'Completed ✓' : 'Mark as Complete'}
                </button>
              </div>

              {/* Downloadable Resources */}
              {currentLesson.resources?.length > 0 && (
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-indigo-400" />
                    Downloadable Resources & Files
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentLesson.resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 glass-card rounded-xl border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center justify-between"
                      >
                        <span className="truncate font-medium">{res.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Quiz Assessment Taking View */}
          {activeTab === 'quiz' && currentQuiz && (
            <div className="space-y-6 glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                    Interactive Assessment
                  </span>
                  <h2 className="text-xl font-black text-white">{currentQuiz.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">{currentQuiz.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Passing Score:</span>
                  <span className="block text-sm font-bold text-amber-300">{currentQuiz.passingScorePercent}%</span>
                </div>
              </div>

              {/* Quiz Result Banner */}
              {quizResult && (
                <div className={`p-4 rounded-2xl border ${
                  quizResult.passed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                } flex items-center justify-between`}>
                  <div>
                    <h4 className="font-bold text-sm">
                      {quizResult.passed ? '🎉 Congratulations! You Passed!' : '⚠️ Passing Score Not Met'}
                    </h4>
                    <p className="text-xs mt-0.5">
                      Your Score: {quizResult.totalScore}/{quizResult.maxScore} points ({quizResult.percentage}%)
                    </p>
                  </div>
                  <button
                    onClick={() => setQuizResult(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-xs font-semibold hover:text-white"
                  >
                    Retake Quiz
                  </button>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-6">
                {currentQuiz.questions?.map((q, qIndex) => (
                  <div key={q._id || qIndex} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">
                        {qIndex + 1}. {q.question}
                      </h4>
                      <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                        {q.points || 10} pts
                      </span>
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                      {q.options?.map((opt, optIndex) => (
                        <label
                          key={optIndex}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            quizAnswers[q._id] === opt
                              ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q_${q._id}`}
                            value={opt}
                            checked={quizAnswers[q._id] === opt}
                            onChange={() => setQuizAnswers({ ...quizAnswers, [q._id]: opt })}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>

                    {/* Show explanation if graded */}
                    {quizResult && q.explanation && (
                      <div className="p-3 bg-slate-900 rounded-xl text-xs text-slate-400 border-l-2 border-indigo-400">
                        <span className="font-semibold text-indigo-300">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!quizResult && (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={quizSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all"
                >
                  {quizSubmitting ? 'Evaluating Answers...' : 'Submit Assessment Answers'}
                </button>
              )}
            </div>
          )}

          {/* TAB 3: Assignment Submission View */}
          {activeTab === 'assignment' && currentAssignment && (
            <div className="space-y-6 glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                  Practical Project Assignment
                </span>
                <h2 className="text-xl font-black text-white">{currentAssignment.title}</h2>
                <p className="text-xs text-slate-300 mt-2 whitespace-pre-line">
                  {currentAssignment.description}
                </p>
                {currentAssignment.instructions && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 whitespace-pre-line">
                    {currentAssignment.instructions}
                  </div>
                )}
              </div>

              {/* Graded evaluation if present */}
              {currentSubmission?.status === 'graded' && (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">Instructor Evaluation Grade</span>
                    <span className="text-lg font-black text-white">{currentSubmission.grade}/100</span>
                  </div>
                  <p className="text-xs text-slate-300 italic">"{currentSubmission.feedback}"</p>
                </div>
              )}

              {/* Submission Form */}
              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Project / GitHub Repository URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username/project-repo"
                    value={assignmentForm.projectUrl}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, projectUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Written Explanation & Architecture Overview</label>
                  <textarea
                    rows={4}
                    placeholder="Describe how you solved this challenge..."
                    value={assignmentForm.content}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, content: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={assignmentSubmitting}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-purple-600/30"
                >
                  {assignmentSubmitting ? 'Submitting...' : 'Submit Project Work'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: Discussions Forum */}
          {activeTab === 'discussions' && (
            <div className="space-y-6">
              {/* Ask Question Form */}
              <form onSubmit={handlePostQuestion} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ask a Question in this Course</h3>
                <input
                  type="text"
                  placeholder="Question title..."
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <textarea
                  rows={2}
                  placeholder="Details or code snippet..."
                  value={newQuestion.content}
                  onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  Post Question
                </button>
              </form>

              {/* Discussion Threads List */}
              <div className="space-y-4">
                {discussions.map((disc) => (
                  <div key={disc._id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={disc.userId?.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={disc.userId?.fullName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <span className="text-xs font-bold text-white">{disc.userId?.fullName}</span>
                          <span className="text-[10px] text-slate-500 block">
                            {new Date(disc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {disc.isPinned && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          📌 Pinned Discussion
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white">{disc.title}</h4>
                    <p className="text-xs text-slate-300">{disc.content}</p>

                    {/* Replies */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      {disc.replies?.map((rep, rIdx) => (
                        <div
                          key={rIdx}
                          className={`p-3 rounded-xl text-xs space-y-1 ${
                            rep.isInstructorAnswer
                              ? 'bg-purple-950/30 border border-purple-500/30 text-purple-200'
                              : 'bg-slate-900/60 border border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              {rep.userId?.fullName}
                              {rep.isInstructorAnswer && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300">
                                  Instructor Answer
                                </span>
                              )}
                            </span>
                          </div>
                          <p>{rep.content}</p>
                        </div>
                      ))}

                      {/* Reply Input Box */}
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Write a helpful response..."
                          value={replyText[disc._id] || ''}
                          onChange={(e) => setReplyText({ ...replyText, [disc._id]: e.target.value })}
                          className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleReplyDiscussion(disc._id)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Personal Notes */}
          {activeTab === 'notes' && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Your Course Notebook
              </h3>
              <p className="text-xs text-slate-400">
                Notes are auto-saved to your browser storage so you can review key snippets anytime.
              </p>
              <textarea
                rows={12}
                value={notes}
                onChange={(e) => handleSaveNotes(e.target.value)}
                placeholder="Write your study notes, code snippets, architectural ideas..."
                className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </main>
      </div>

      {/* Certificate Modal */}
      {certificate && (
        <CertificateModal
          certificate={certificate}
          onClose={() => setCertificate(null)}
        />
      )}
    </div>
  );
};
