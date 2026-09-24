import React from 'react';
import { Shield, Sparkles, GraduationCap } from 'lucide-react';

export const RoleBadge = ({ role }) => {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <Shield className="w-3 h-3 text-rose-400" />
        Admin
      </span>
    );
  }
  if (role === 'instructor') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
        <Sparkles className="w-3 h-3 text-purple-400" />
        Instructor
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
      <GraduationCap className="w-3 h-3 text-indigo-400" />
      Student
    </span>
  );
};
