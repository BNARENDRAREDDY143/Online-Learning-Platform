import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  Save,
  PlusCircle,
  Trash2,
  PlayCircle,
  FileText,
  HelpCircle,
  CheckCircle,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const CreateEditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [categories, setCategories] = useState([]);
  const [courseData, setCourseData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'Web Development',
    level: 'beginner',
    price: 0,
    discount: 0,
    durationHours: 10,
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    previewVideoUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
    status: 'published',
    objectives: '',
    requirements: ''
  });

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal / Form state for adding Section, Lesson, Quiz
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [lessonModal, setLessonModal] = useState(false);
  const [quizModal, setQuizModal] = useState(false);

  // Lesson form
  const [lessonForm, setLessonForm] = useState({
    title: '',
    type: 'video',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    articleBody: '',
    durationMinutes: 10,
    isFreePreview: false
  });

  // Quiz form
  const [quizForm, setQuizForm] = useState({
    title: 'Module Assessment',
    passingScorePercent: 70,
    questionText: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: '',
    explanation: ''
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchCourse();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/admin/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/courses/${id}`);
      if (res.data.success) {
        const c = res.data.course;
        setCourseData({
          title: c.title || '',
          subtitle: c.subtitle || '',
          description: c.description || '',
          category: c.category || 'Web Development',
          level: c.level || 'beginner',
          price: c.price || 0,
          discount: c.discount || 0,
          durationHours: c.durationHours || 10,
          thumbnail: c.thumbnail || '',
          previewVideoUrl: c.previewVideoUrl || '',
          status: c.status || 'published',
          objectives: Array.isArray(c.objectives) ? c.objectives.join('\n') : '',
          requirements: Array.isArray(c.requirements) ? c.requirements.join('\n') : ''
        });
        setSections(c.sections || []);
      }
    } catch (err) {
      console.error('Failed to fetch course details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...courseData,
        objectives: courseData.objectives.split('\n').filter(Boolean),
        requirements: courseData.requirements.split('\n').filter(Boolean)
      };

      if (isEditing) {
        await API.put(`/courses/${id}`, payload);
        alert('Course details updated successfully!');
      } else {
        const res = await API.post('/courses', payload);
        if (res.data.success) {
          navigate(`/instructor/courses/edit/${res.data.course._id}`);
        }
      }
    } catch (err) {
      console.error('Error saving course', err);
      alert('Error saving course: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) return;
    try {
      const res = await API.post(`/courses/${id}/sections`, { title: newSectionTitle });
      if (res.data.success) {
        setSections([...sections, { ...res.data.section, lessons: [] }]);
        setNewSectionTitle('');
      }
    } catch (err) {
      console.error('Error adding section', err);
    }
  };

  const handleAddLesson = async () => {
    if (!lessonForm.title.trim() || !activeSectionId) return;
    try {
      const res = await API.post(`/sections/${activeSectionId}/lessons`, {
        title: lessonForm.title,
        type: lessonForm.type,
        durationMinutes: Number(lessonForm.durationMinutes),
        isFreePreview: lessonForm.isFreePreview,
        content: {
          videoUrl: lessonForm.videoUrl,
          articleBody: lessonForm.articleBody
        }
      });
      if (res.data.success) {
        setSections(sections.map(s => {
          if (s._id === activeSectionId) {
            return { ...s, lessons: [...(s.lessons || []), res.data.lesson] };
          }
          return s;
        }));
        setLessonModal(false);
        setLessonForm({
          title: '',
          type: 'video',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          articleBody: '',
          durationMinutes: 10,
          isFreePreview: false
        });
      }
    } catch (err) {
      console.error('Error adding lesson', err);
    }
  };

  const handleAddQuiz = async () => {
    if (!quizForm.title.trim() || !quizForm.questionText.trim() || !activeSectionId) return;
    try {
      const options = [quizForm.option1, quizForm.option2, quizForm.option3, quizForm.option4].filter(Boolean);
      const questions = [{
        question: quizForm.questionText,
        type: 'mcq',
        options,
        correctAnswer: quizForm.correctAnswer || options[0],
        explanation: quizForm.explanation,
        points: 10
      }];

      const res = await API.post(`/quizzes/course/${id}`, {
        sectionId: activeSectionId,
        title: quizForm.title,
        passingScorePercent: Number(quizForm.passingScorePercent),
        questions
      });

      if (res.data.success) {
        setSections(sections.map(s => s._id === activeSectionId ? { ...s, quizId: res.data.quiz } : s));
        setQuizModal(false);
        alert('Assessment added to module successfully!');
      }
    } catch (err) {
      console.error('Error creating quiz', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/instructor/courses')}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {isEditing ? 'Course Studio & Curriculum Builder' : 'Create New Course'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure course details, pricing, lectures, quizzes, and projects.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveCourse}
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Course Details'}
        </button>
      </div>

      {/* Main Form Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Course General Info */}
        <div className="lg:col-span-1 space-y-6 glass-panel p-6 rounded-3xl border border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">General Information</h3>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Course Title</label>
              <input
                type="text"
                required
                value={courseData.title}
                onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                placeholder="e.g. Masterclass React 18 Architecture"
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Subtitle / Tagline</label>
              <input
                type="text"
                value={courseData.subtitle}
                onChange={(e) => setCourseData({ ...courseData, subtitle: e.target.value })}
                placeholder="Brief high-impact summary..."
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Category</label>
              <select
                value={courseData.category}
                onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Level</label>
                <select
                  value={courseData.level}
                  onChange={(e) => setCourseData({ ...courseData, level: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="all_levels">All Levels</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Price ($ USD)</label>
                <input
                  type="number"
                  value={courseData.price}
                  onChange={(e) => setCourseData({ ...courseData, price: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Thumbnail Image URL</label>
              <input
                type="url"
                value={courseData.thumbnail}
                onChange={(e) => setCourseData({ ...courseData, thumbnail: e.target.value })}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Status</label>
              <select
                value={courseData.status}
                onChange={(e) => setCourseData({ ...courseData, status: e.target.value })}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Course Description</label>
              <textarea
                rows={4}
                value={courseData.description}
                onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Curriculum & Modules Builder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Curriculum & Sections</h3>
                <p className="text-xs text-slate-400 mt-0.5">Build modules, add video/document lectures & quizzes.</p>
              </div>
            </div>

            {/* Add New Section input */}
            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New module title (e.g. Module 3: State Management)..."
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold whitespace-nowrap"
                >
                  Add Module
                </button>
              </div>
            )}

            {/* Sections Accordion */}
            <div className="space-y-4">
              {sections.map((sec) => (
                <div key={sec._id} className="glass-card rounded-2xl border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{sec.title}</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveSectionId(sec._id);
                          setLessonModal(true);
                        }}
                        className="px-3 py-1 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        + Add Lecture
                      </button>
                      <button
                        onClick={() => {
                          setActiveSectionId(sec._id);
                          setQuizModal(true);
                        }}
                        className="px-3 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 rounded-lg text-xs font-semibold transition-colors"
                      >
                        + Add Quiz
                      </button>
                    </div>
                  </div>

                  {/* Lessons list inside section */}
                  <div className="divide-y divide-slate-800/60 pt-2">
                    {sec.lessons?.map((les) => (
                      <div key={les._id} className="py-2 flex items-center justify-between text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          {les.type === 'video' ? <PlayCircle className="w-4 h-4 text-indigo-400" /> : <FileText className="w-4 h-4 text-purple-400" />}
                          <span>{les.title}</span>
                          {les.isFreePreview && (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">Preview</span>
                          )}
                        </div>
                        <span className="text-slate-500">{les.durationMinutes || 10}m</span>
                      </div>
                    ))}

                    {sec.quizId && (
                      <div className="py-2 flex items-center justify-between text-xs text-amber-300">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-amber-400" />
                          <span>Assessment: {sec.quizId.title}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Lesson Modal */}
      {lessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Add New Lecture</h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Lesson Title</label>
                <input
                  type="text"
                  required
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="e.g. 1.2 Custom Hooks & Component Architecture"
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Type</label>
                  <select
                    value={lessonForm.type}
                    onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  >
                    <option value="video">Video Lecture</option>
                    <option value="article">Reading Article</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={lessonForm.durationMinutes}
                    onChange={(e) => setLessonForm({ ...lessonForm, durationMinutes: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              {lessonForm.type === 'video' ? (
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Video URL (YouTube or MP4)</label>
                  <input
                    type="url"
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Markdown Article Content</label>
                  <textarea
                    rows={5}
                    value={lessonForm.articleBody}
                    onChange={(e) => setLessonForm({ ...lessonForm, articleBody: e.target.value })}
                    placeholder="Write formatted markdown text and code blocks..."
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              )}

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={lessonForm.isFreePreview}
                  onChange={(e) => setLessonForm({ ...lessonForm, isFreePreview: e.target.checked })}
                  className="rounded text-purple-600"
                />
                <span>Allow Free Preview for non-enrolled students</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setLessonModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddLesson}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs"
              >
                Save Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Quiz Modal */}
      {quizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 border border-amber-500/30 space-y-4">
            <h3 className="text-base font-bold text-white">Create Assessment Quiz</h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Quiz Title</label>
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Passing Score (%)</label>
                  <input
                    type="number"
                    value={quizForm.passingScorePercent}
                    onChange={(e) => setQuizForm({ ...quizForm, passingScorePercent: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-amber-300">Question Text</label>
                <input
                  type="text"
                  placeholder="e.g. What is the return value of useEffect?"
                  value={quizForm.questionText}
                  onChange={(e) => setQuizForm({ ...quizForm, questionText: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Option 1 (e.g. An optional cleanup function)"
                  value={quizForm.option1}
                  onChange={(e) => setQuizForm({ ...quizForm, option1: e.target.value })}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Option 2 (e.g. A promise)"
                  value={quizForm.option2}
                  onChange={(e) => setQuizForm({ ...quizForm, option2: e.target.value })}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Option 3 (e.g. An array)"
                  value={quizForm.option3}
                  onChange={(e) => setQuizForm({ ...quizForm, option3: e.target.value })}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Option 4 (e.g. None)"
                  value={quizForm.option4}
                  onChange={(e) => setQuizForm({ ...quizForm, option4: e.target.value })}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-emerald-400">Exact Correct Answer</label>
                <input
                  type="text"
                  placeholder="Must match one of the options above exactly"
                  value={quizForm.correctAnswer}
                  onChange={(e) => setQuizForm({ ...quizForm, correctAnswer: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Explanation for Student</label>
                <input
                  type="text"
                  placeholder="Why is this answer correct?"
                  value={quizForm.explanation}
                  onChange={(e) => setQuizForm({ ...quizForm, explanation: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setQuizModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddQuiz}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Attach Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
