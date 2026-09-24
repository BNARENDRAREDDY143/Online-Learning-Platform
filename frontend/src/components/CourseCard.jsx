import React from 'react';
import { Link } from 'react-router-dom';
import { RatingStars } from './RatingStars';
import { Clock, BookOpen, Users, ArrowRight } from 'lucide-react';

export const CourseCard = ({ course, progress, isEnrolled }) => {
  const isFree = course.price === 0;
  const discountedPrice = course.discount > 0 ? (course.price * (1 - course.discount / 100)).toFixed(2) : course.price;

  // Calculate total lessons
  const totalLessons = course.sections?.reduce((sum, sec) => sum + (sec.lessons?.length || 0), 0) || 0;

  return (
    <div className="group glass-card rounded-2xl overflow-hidden flex flex-col h-full bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-slate-950">
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-950/80 backdrop-blur-md text-indigo-300 border border-indigo-500/30">
            {course.category}
          </span>
          {course.isFeatured && (
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
              Featured
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-900/90 text-slate-300 capitalize border border-slate-700">
            {course.level?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & reviews */}
          <div className="mb-2">
            <RatingStars rating={course.rating || 4.8} reviewsCount={course.reviewCount || 45} />
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 mb-2">
            <Link to={isEnrolled ? `/learn/${course._id}` : `/courses/${course._id}`}>
              {course.title}
            </Link>
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 mb-4">
            {course.subtitle || course.description?.replace(/<[^>]*>?/gm, '')}
          </p>
        </div>

        <div>
          {/* Course Meta */}
          <div className="flex items-center gap-4 text-xs text-slate-400 py-3 border-t border-slate-800/80 mb-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {course.durationHours || 10}h
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              {totalLessons > 0 ? `${totalLessons} lessons` : 'Comprehensive'}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              {course.enrollmentCount || 0}
            </span>
          </div>

          {/* Progress bar if student is enrolled */}
          {progress !== undefined ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Progress</span>
                <span className="font-semibold text-indigo-400">{progress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <Link
                to={`/learn/${course._id}`}
                className="mt-3 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
              >
                {progress === 100 ? 'Review Course' : 'Continue Learning'}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
              <div>
                {isFree ? (
                  <span className="text-sm font-extrabold text-emerald-400 uppercase tracking-wide">
                    Free Course
                  </span>
                ) : (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-white">
                      ${discountedPrice}
                    </span>
                    {course.discount > 0 && (
                      <span className="text-xs text-slate-500 line-through">
                        ${course.price}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Link
                to={`/courses/${course._id}`}
                className="py-1.5 px-3.5 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700 hover:border-indigo-500 flex items-center gap-1.5"
              >
                View Course
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
