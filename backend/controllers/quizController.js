const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');
const Course = require('../models/Course');
const Section = require('../models/Section');
const Enrollment = require('../models/Enrollment');

// @desc    Create quiz
// @route   POST /api/courses/:courseId/quizzes
// @access  Private (Instructor/Admin)
exports.createQuiz = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { sectionId, title, description, timeLimitMinutes, passingScorePercent, questions } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const quiz = await Quiz.create({
      courseId,
      sectionId: sectionId || null,
      title,
      description: description || '',
      timeLimitMinutes: Number(timeLimitMinutes) || 15,
      passingScorePercent: Number(passingScorePercent) || 70,
      questions: questions || []
    });

    if (sectionId) {
      await Section.findByIdAndUpdate(sectionId, { quizId: quiz._id });
    }

    res.status(201).json({
      success: true,
      quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quiz for taking (sanitizing correct answers for students if needed)
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check previous submissions
    const latestSubmission = await QuizSubmission.findOne({
      quizId: quiz._id,
      studentId: req.user.id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      quiz,
      latestSubmission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz answers and evaluate
// @route   POST /api/quizzes/:id/submit
// @access  Private (Student)
exports.submitQuiz = async (req, res, next) => {
  try {
    const quizId = req.params.id;
    const { answers, timeSpentSeconds } = req.body; // answers: [{ questionId, selectedAnswer }]

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let totalScore = 0;
    let maxScore = 0;

    const evaluatedAnswers = quiz.questions.map((q) => {
      const qPoints = q.points || 10;
      maxScore += qPoints;

      const userAnsObj = (answers || []).find(a => a.questionId === q._id.toString() || a.questionIndex === q.order);
      const userSelected = userAnsObj ? userAnsObj.selectedAnswer : null;

      let isCorrect = false;
      if (userSelected !== null && userSelected !== undefined) {
        if (typeof q.correctAnswer === 'string' && typeof userSelected === 'string') {
          isCorrect = q.correctAnswer.trim().toLowerCase() === userSelected.trim().toLowerCase();
        } else {
          isCorrect = q.correctAnswer == userSelected;
        }
      }

      const pointsEarned = isCorrect ? qPoints : 0;
      totalScore += pointsEarned;

      return {
        questionId: q._id,
        questionText: q.question,
        selectedAnswer: userSelected,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        isCorrect,
        pointsEarned
      };
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 100;
    const passed = percentage >= quiz.passingScorePercent;

    const submission = await QuizSubmission.create({
      quizId,
      courseId: quiz.courseId,
      studentId: req.user.id,
      answers: evaluatedAnswers,
      totalScore,
      maxScore,
      percentage,
      passed,
      timeSpentSeconds: timeSpentSeconds || 0
    });

    // Update student enrollment
    const enrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId: quiz.courseId
    });

    if (enrollment) {
      const existingQuizIdx = enrollment.completedQuizzes.findIndex(q => q.quizId.toString() === quizId);
      if (existingQuizIdx > -1) {
        enrollment.completedQuizzes[existingQuizIdx] = { quizId, score: percentage, passed };
      } else {
        enrollment.completedQuizzes.push({ quizId, score: percentage, passed });
      }
      await enrollment.save();
    }

    res.status(200).json({
      success: true,
      submission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Instructor/Admin)
exports.updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, quiz });
  } catch (error) {
    next(error);
  }
};
