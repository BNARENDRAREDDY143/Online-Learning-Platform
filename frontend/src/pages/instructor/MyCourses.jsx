import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { PlusCircle, Edit3, Trash2, Eye, BookOpen, Users, DollarSign } from 'lucide-react';

export const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await API.get('/courses/instructor/my-courses');
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error('Failed to load instructor courses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course and all its modules?')) return;
    try {
      await API.delete(`/courses/${id}`);
      setCourses(courses.filter(c => c._id !== id));
    } catch (err) {
      console.error('Error deleting course', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Manage Courses</h1>
          <p className="text-xs text-slate-400 mt-1">Create, update curriculum, and publish courses.</p>
        </div>
        <Link
          to="/instructor/courses/new"
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Course
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 glass-panel rounded-2xl animate-pulse"></div>)}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl space-y-4">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No courses created yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Ready to share your knowledge? Create your first curriculum and start inspiring learners.
          </p>
          <Link
            to="/instructor/courses/new"
            className="inline-block px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-semibold"
          >
            Launch Course Studio
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course._id}
              className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-24 h-16 rounded-xl object-cover"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      {course.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${
                      course.status === 'published' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      ● {course.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{course.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>{course.enrollmentCount || 0} Students</span>
                    <span>${course.price}</span>
                    <span>{course.sections?.length || 0} Sections</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <Link
                  to={`/learn/${course._id}`}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  title="Preview Course"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <Link
                  to={`/instructor/courses/edit/${course._id}`}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Course
                </Link>
                <button
                  onClick={() => handleDelete(course._id)}
                  className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold transition-colors"
                  title="Delete Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
