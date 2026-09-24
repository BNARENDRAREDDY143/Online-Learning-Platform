# 📚 LearnPulse - Online Learning & Course Management Platform

A comprehensive, production-ready Full-Stack Online Learning Platform built with **React 18**, **Tailwind CSS**, **Node.js/Express**, and **MongoDB**.

---

## 🚀 Folder Structure

```
c:/online Learning Platform/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── assignmentController.js
│   │   ├── certificateController.js
│   │   ├── courseController.js
│   │   ├── discussionController.js
│   │   ├── enrollmentController.js
│   │   ├── lessonController.js
│   │   ├── quizController.js
│   │   └── sectionController.js
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer verification
│   │   ├── roleMiddleware.js     # Role access (student/instructor/admin)
│   │   ├── uploadMiddleware.js   # Multer storage for media
│   │   └── errorHandler.js       # Centralized error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Section.js
│   │   ├── Lesson.js
│   │   ├── Quiz.js
│   │   ├── Assignment.js
│   │   ├── Enrollment.js
│   │   ├── QuizSubmission.js
│   │   ├── AssignmentSubmission.js
│   │   ├── Certificate.js
│   │   ├── Discussion.js
│   │   └── Category.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── assignmentRoutes.js
│   │   ├── certificateRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── discussionRoutes.js
│   │   ├── lessonRoutes.js
│   │   ├── quizRoutes.js
│   │   ├── sectionRoutes.js
│   │   └── uploadRoutes.js
│   ├── seed.js                   # Pre-populates rich courses, quizzes, assignments & users
│   ├── server.js                 # Express server entry point
│   ├── .env                      # Database URI & JWT Secrets
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx        # Top navigation with 1-Click Role Switcher
    │   │   ├── Footer.jsx
    │   │   ├── CourseCard.jsx    # Responsive card with progress & pricing
    │   │   ├── RatingStars.jsx
    │   │   ├── RoleBadge.jsx
    │   │   └── CertificateModal.jsx # High-res PDF download & verification
    │   ├── context/
    │   │   └── AuthContext.jsx   # State management & instant demo auth
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── CourseCatalog.jsx # Filters, search, category pills & sort
    │   │   ├── CourseDetail.jsx  # Syllabus preview, instructor info & checkout
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── VerifyCertificate.jsx # Public ID lookup & validation
    │   │   ├── Profile.jsx
    │   │   ├── student/
    │   │   │   ├── StudentDashboard.jsx # Streak tracking & stats
    │   │   │   ├── MyLearning.jsx
    │   │   │   ├── LearningRoom.jsx     # Video/doc player, quizzes & projects
    │   │   │   └── CertificatesPage.jsx
    │   │   ├── instructor/
    │   │   │   ├── InstructorDashboard.jsx # Revenue & enrollment analytics
    │   │   │   ├── MyCourses.jsx
    │   │   │   ├── CreateEditCourse.jsx    # Multi-step curriculum builder
    │   │   │   └── GradeSubmissions.jsx    # Evaluation queue & grading
    │   │   └── admin/
    │   │       ├── AdminDashboard.jsx
    │   │       ├── UserManagement.jsx      # Role & status management
    │   │       └── CategoryManagement.jsx  # Category taxonomy
    │   ├── services/
    │   │   └── api.js            # Axios client with JWT interceptor
    │   ├── App.jsx               # Client routes & protected route guards
    │   ├── main.jsx
    │   └── index.css             # Glassmorphism & custom gradients
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## ⚡ Quick Start Guide

### 1. Start the Backend API
```bash
cd backend
npm install
npm run seed     # Populate database with realistic courses & demo accounts
npm start        # Starts server on http://localhost:5000
```

### 2. Start the Frontend React App
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 🔑 Demo Login Accounts (or use the 1-Click buttons in the top navbar)

| Role | Email | Password | Features Accessible |
|------|-------|----------|---------------------|
| **Student** | `student@demo.com` | `password123` | Enroll, watch lectures, take timed quizzes, submit projects, download certificates |
| **Instructor** | `instructor@demo.com` | `password123` | Create courses, curriculum builder, add quizzes, grade submissions, view revenue |
| **Admin** | `admin@demo.com` | `admin123` | Platform analytics, user management, suspension controls, category management |

---

## 📜 Public Certificate Verification
- Test certificate verification at: `http://localhost:5173/verify?id=CERT-2026-MERN99`
