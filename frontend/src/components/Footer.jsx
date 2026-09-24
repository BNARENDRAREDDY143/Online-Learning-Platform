import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Linkedin, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">LearnPulse</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            A next-generation interactive learning platform designed for ambitious developers, designers, and creators worldwide.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a href="#" className="p-2 rounded-lg bg-slate-900 hover:text-white hover:bg-slate-800 transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-slate-900 hover:text-white hover:bg-slate-800 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-slate-900 hover:text-white hover:bg-slate-800 transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Explore</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/courses" className="hover:text-white transition-colors">Course Catalog</Link></li>
            <li><Link to="/courses?category=Web Development" className="hover:text-white transition-colors">Web Development</Link></li>
            <li><Link to="/courses?category=UI/UX Design" className="hover:text-white transition-colors">UI/UX Design Systems</Link></li>
            <li><Link to="/courses?category=Data Science & AI" className="hover:text-white transition-colors">Data Science & AI</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Credentials</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/verify" className="hover:text-white transition-colors">Verify Certificate</Link></li>
            <li><Link to="/student/certificates" className="hover:text-white transition-colors">My Certificates</Link></li>
            <li><a href="#" className="hover:text-white transition-colors">Accreditation Standards</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Digital Badges</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/instructor/dashboard" className="hover:text-white transition-colors">Teach on LearnPulse</Link></li>
            <li><Link to="/admin/dashboard" className="hover:text-white transition-colors">Admin Portal</Link></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 LearnPulse Learning Technologies Inc. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for lifelong learners.
        </p>
      </div>
    </footer>
  );
};
