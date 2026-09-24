const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Course = require('./models/Course');
const Section = require('./models/Section');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
const Assignment = require('./models/Assignment');
const Enrollment = require('./models/Enrollment');
const QuizSubmission = require('./models/QuizSubmission');
const AssignmentSubmission = require('./models/AssignmentSubmission');
const Certificate = require('./models/Certificate');
const Discussion = require('./models/Discussion');
const Category = require('./models/Category');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online_learning_platform');
    console.log('🌱 Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Section.deleteMany({}),
      Lesson.deleteMany({}),
      Quiz.deleteMany({}),
      Assignment.deleteMany({}),
      Enrollment.deleteMany({}),
      QuizSubmission.deleteMany({}),
      AssignmentSubmission.deleteMany({}),
      Certificate.deleteMany({}),
      Discussion.deleteMany({}),
      Category.deleteMany({})
    ]);

    console.log('🧹 Cleared existing database records.');

    // 1. Categories
    const categories = await Category.insertMany([
      { name: 'Web Development', slug: 'web-development', description: 'Master frontend, backend, and full-stack web technologies.', icon: 'Code', color: 'from-blue-500 to-indigo-600' },
      { name: 'UI/UX Design', slug: 'ui-ux-design', description: 'Design delightful experiences, design systems, and prototypes.', icon: 'Palette', color: 'from-fuchsia-500 to-pink-600' },
      { name: 'Data Science & AI', slug: 'data-science-ai', description: 'Analyze data, train machine learning models and neural nets.', icon: 'Brain', color: 'from-emerald-500 to-teal-600' },
      { name: 'Cloud & DevOps', slug: 'cloud-devops', description: 'Containerization, CI/CD, Kubernetes, and scalable infrastructure.', icon: 'Cloud', color: 'from-amber-500 to-orange-600' },
      { name: 'Mobile Development', slug: 'mobile-development', description: 'Build native and cross-platform apps with React Native & Flutter.', icon: 'Smartphone', color: 'from-purple-500 to-violet-600' },
      { name: 'Cybersecurity', slug: 'cybersecurity', description: 'Ethical hacking, network defense, and application security.', icon: 'Shield', color: 'from-rose-500 to-red-600' }
    ]);
    console.log(`📁 Inserted ${categories.length} categories.`);

    // 2. Users (Student, Instructor, Admin)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const adminPassword = await bcrypt.hash('admin123', salt);

    const admin = await User.create({
      email: 'admin@demo.com',
      username: 'superadmin',
      password: adminPassword,
      firstName: 'Antigravity',
      lastName: 'Administrator',
      role: 'admin',
      title: 'Platform Master Admin',
      profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      bio: 'Overseeing platform operations, course quality, and community standards.'
    });

    const instructor1 = await User.create({
      email: 'instructor@demo.com',
      username: 'sarah_jenkins',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      role: 'instructor',
      title: 'Staff Software Architect & Tech Lead',
      profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      bio: 'Ex-Google Staff Engineer with 12+ years building distributed web applications and modern React architectures.',
      expertise: ['React', 'Node.js', 'TypeScript', 'System Design', 'MongoDB'],
      socialLinks: {
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        twitter: 'https://twitter.com'
      }
    });

    const instructor2 = await User.create({
      email: 'david@demo.com',
      username: 'david_miller',
      password: hashedPassword,
      firstName: 'David',
      lastName: 'Miller',
      role: 'instructor',
      title: 'Principal Product Designer',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Designing world-class products for over a decade. Creator of top Figma design systems and UX workshops.',
      expertise: ['UI/UX', 'Figma', 'Design Systems', 'Design Tokens', 'Tailwind CSS']
    });

    const student1 = await User.create({
      email: 'student@demo.com',
      username: 'alex_rivera',
      password: hashedPassword,
      firstName: 'Alex',
      lastName: 'Rivera',
      role: 'student',
      title: 'Aspiring Full Stack Engineer',
      profilePicture: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
      bio: 'Passionate about modern web technologies, building creative SaaS apps, and clean code.',
      streakDays: 7
    });

    const student2 = await User.create({
      email: 'emma@demo.com',
      username: 'emma_watson',
      password: hashedPassword,
      firstName: 'Emma',
      lastName: 'Watson',
      role: 'student',
      title: 'Frontend Developer',
      profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      bio: 'Learning full-stack development and UI systems.',
      streakDays: 3
    });

    console.log('👤 Created demo users: Student, Instructors, and Super Admin.');

    // 3. Course 1: Full-Stack React & Node.js Mastery
    const course1 = await Course.create({
      title: 'Full-Stack MERN Architecture & Production Masterclass',
      subtitle: 'Build scalable, real-world web apps with React 18, Node.js, Express, MongoDB, and Tailwind CSS.',
      slug: 'fullstack-mern-architecture-masterclass',
      description: 'Step into modern full-stack development with enterprise best practices. In this comprehensive course, you will learn to build a production-ready application from wireframe to deployment. Learn authentication with JWT, state management with Zustand/React Context, REST APIs with Express, database indexing with MongoDB, and modern glassmorphism styling with Tailwind CSS.',
      instructorId: instructor1._id,
      category: 'Web Development',
      subcategory: 'Full Stack',
      level: 'intermediate',
      price: 89.99,
      discount: 20,
      durationHours: 18.5,
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80',
      previewVideoUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
      rating: 4.9,
      reviewCount: 142,
      enrollmentCount: 520,
      isFeatured: true,
      status: 'published',
      objectives: [
        'Architect scalable MERN applications with clean folder structure',
        'Implement bulletproof JWT Authentication with refresh tokens and role-based access',
        'Design efficient MongoDB schemas with indexing, virtuals, and aggregation pipelines',
        'Craft ultra-sleek, responsive user interfaces with Tailwind CSS and Framer Motion'
      ],
      requirements: [
        'Basic familiarity with JavaScript (ES6+)',
        'Understanding of HTML and CSS basics',
        'Node.js installed on your computer'
      ]
    });

    // Sections for Course 1
    const c1_sec1 = await Section.create({
      courseId: course1._id,
      title: 'Module 1: Architecture, Project Scaffolding & Setup',
      description: 'Understanding the MERN stack layout, dev tooling, and environment config.',
      order: 1
    });

    const c1_l1 = await Lesson.create({
      sectionId: c1_sec1._id,
      courseId: course1._id,
      title: '1.1 Course Welcome & Architecture Blueprint',
      type: 'video',
      order: 1,
      durationMinutes: 12,
      isFreePreview: true,
      content: {
        videoUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
        articleBody: `### Welcome to Full-Stack MERN Architecture!

In this module, we lay the bedrock for building production-grade web applications.

#### Key Takeaways:
- **Clean Architecture**: Separation of presentation, business logic, and database persistence layers.
- **RESTful Principles**: Standard HTTP status codes (200, 201, 400, 401, 403, 404, 500).
- **Environment Management**: Keeping secrets out of git with \`.env\` and \`.env.example\`.`,
        transcript: 'Welcome everyone! Today we begin our journey constructing enterprise MERN apps...'
      },
      resources: [
        { title: 'Course Architecture Diagram PDF', url: 'https://example.com/arch-diagram.pdf', type: 'pdf' },
        { title: 'Starter GitHub Boilerplate', url: 'https://github.com', type: 'zip' }
      ]
    });

    const c1_l2 = await Lesson.create({
      sectionId: c1_sec1._id,
      courseId: course1._id,
      title: '1.2 Modern React 18 Patterns & State Architecture',
      type: 'article',
      order: 2,
      durationMinutes: 18,
      content: {
        articleBody: `### React 18 Core Concepts

React 18 introduces concurrent rendering, automatic batching, and streamlined hooks.

#### 1. Custom Hooks for Data Fetching
Creating reusable hooks encapsulates Axios calls and error handling:

\`\`\`javascript
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    axios.get(url).then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, [url]);

  return { data, loading };
}
\`\`\`

#### 2. Context vs Local State
Keep component-specific state localized, and hoist only cross-cutting concerns (such as Authentication and Theme) to Context providers.`
      }
    });

    // Quiz 1 for Course 1
    const c1_quiz = await Quiz.create({
      courseId: course1._id,
      sectionId: c1_sec1._id,
      title: 'Module 1 Knowledge Check: React & Node Fundamentals',
      description: 'Test your understanding of React 18 rendering, state, and Node.js REST concepts.',
      timeLimitMinutes: 10,
      passingScorePercent: 70,
      questions: [
        {
          question: 'What is the primary benefit of automatic batching in React 18?',
          type: 'mcq',
          options: [
            'It groups multiple state updates together to prevent unnecessary re-renders',
            'It automatically creates database tables',
            'It prevents CSS clashes',
            'It turns client components into server components'
          ],
          correctAnswer: 'It groups multiple state updates together to prevent unnecessary re-renders',
          explanation: 'Automatic batching in React 18 batches multiple state updates even inside promises, timeouts, and native event handlers to optimize performance.',
          points: 10,
          order: 1
        },
        {
          question: 'Which HTTP status code should be returned when a resource is successfully created?',
          type: 'mcq',
          options: ['200 OK', '201 Created', '204 No Content', '304 Not Modified'],
          correctAnswer: '201 Created',
          explanation: '201 Created is the standard HTTP status indicating a resource was successfully created on the server.',
          points: 10,
          order: 2
        },
        {
          question: 'JWT tokens stored in localStorage are completely immune to XSS attacks.',
          type: 'true_false',
          options: ['True', 'False'],
          correctAnswer: 'False',
          explanation: 'False. Any script injected via XSS can access localStorage. Using httpOnly cookies or in-memory tokens mitigates XSS token theft.',
          points: 10,
          order: 3
        }
      ]
    });

    c1_sec1.lessons = [c1_l1._id, c1_l2._id];
    c1_sec1.quizId = c1_quiz._id;
    await c1_sec1.save();

    // Section 2 for Course 1
    const c1_sec2 = await Section.create({
      courseId: course1._id,
      title: 'Module 2: RESTful API Engineering with Express & MongoDB',
      description: 'Building secure endpoints, schemas, validation, and JWT authentication.',
      order: 2
    });

    const c1_l3 = await Lesson.create({
      sectionId: c1_sec2._id,
      courseId: course1._id,
      title: '2.1 Designing Scalable Mongoose Schemas & Middleware',
      type: 'video',
      order: 1,
      durationMinutes: 24,
      content: {
        videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
        articleBody: 'Detailed walkthrough on Mongoose pre/post hooks, virtual fields, and index optimization.'
      }
    });

    const c1_assignment = await Assignment.create({
      courseId: course1._id,
      sectionId: c1_sec2._id,
      title: 'Practical Project: Build a Robust JWT Authentication Service',
      description: 'Implement secure registration, login, and password hashing using bcryptjs and jsonwebtoken.',
      instructions: `### Assignment Guidelines:
1. Create endpoints for \`/api/auth/register\` and \`/api/auth/login\`.
2. Hash passwords with bcrypt with a salt round of at least 10.
3. Generate JWT tokens with user payload and appropriate expiry.
4. Submit your GitHub repository URL or a code snippet with explanation.`,
      submissionType: 'all',
      maxPoints: 100,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });

    c1_sec2.lessons = [c1_l3._id];
    c1_sec2.assignmentId = c1_assignment._id;
    await c1_sec2.save();

    course1.sections = [c1_sec1._id, c1_sec2._id];
    await course1.save();

    // Course 2: UI/UX Design Systems
    const course2 = await Course.create({
      title: 'Modern UI/UX Design Systems with Figma & Tailwind CSS',
      subtitle: 'Design high-converting interfaces, master design tokens, and build reusable component systems.',
      slug: 'modern-ui-ux-design-systems-figma-tailwind',
      description: 'Transform your design workflow. Learn how top tech companies build design systems that scale across hundreds of engineers and designers. You will master Figma auto-layout, component variants, design tokens, color harmonies, typography scales, and seamless translation into Tailwind CSS classes.',
      instructorId: instructor2._id,
      category: 'UI/UX Design',
      subcategory: 'Design Systems',
      level: 'all_levels',
      price: 69.99,
      discount: 15,
      durationHours: 12.0,
      thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1200&q=80',
      previewVideoUrl: 'https://www.youtube.com/watch?v=c9Wg6Cb_YlU',
      rating: 4.8,
      reviewCount: 98,
      enrollmentCount: 380,
      isFeatured: true,
      status: 'published',
      objectives: [
        'Master Figma Auto Layout 5.0 and Component Properties',
        'Create cohesive Design Tokens for Colors, Spacing, and Typography',
        'Translate Figma styles directly into Tailwind CSS custom themes',
        'Build interactive prototypes that look and feel like production apps'
      ],
      requirements: [
        'Free Figma account',
        'Basic design curiosity—no prior design degree required!'
      ]
    });

    const c2_sec1 = await Section.create({
      courseId: course2._id,
      title: 'Module 1: Design Tokens & Typography Architecture',
      description: 'Foundations of scalable design systems.',
      order: 1
    });

    const c2_l1 = await Lesson.create({
      sectionId: c2_sec1._id,
      courseId: course2._id,
      title: '1.1 The Anatomy of Modern Design Systems',
      type: 'video',
      order: 1,
      durationMinutes: 15,
      isFreePreview: true,
      content: {
        videoUrl: 'https://www.youtube.com/watch?v=c9Wg6Cb_YlU',
        articleBody: 'Understanding atoms, molecules, organisms, and design token hierarchies.'
      }
    });

    c2_sec1.lessons = [c2_l1._id];
    await c2_sec1.save();
    course2.sections = [c2_sec1._id];
    await course2.save();

    // 3. Course 3: Python for Data Science & Machine Learning
    const course3 = await Course.create({
      title: 'Python for Data Science, Analytics & Machine Learning',
      subtitle: 'From exploratory data analysis to training predictive models with Scikit-Learn & Pandas.',
      slug: 'python-data-science-machine-learning',
      description: 'A hands-on, practical journey into Data Science. Work with real-world datasets, visualize insights using Matplotlib & Seaborn, clean noisy data, and build regression & classification algorithms from scratch.',
      instructorId: instructor1._id,
      category: 'Data Science & AI',
      subcategory: 'Machine Learning',
      level: 'beginner',
      price: 0, // Free course
      durationHours: 14.0,
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      previewVideoUrl: 'https://www.youtube.com/watch?v=7eh4d6sabA0',
      rating: 4.9,
      reviewCount: 310,
      enrollmentCount: 1450,
      isFeatured: true,
      status: 'published',
      objectives: [
        'Master Python data structures and NumPy vectorization',
        'Clean, reshape, and analyze large datasets with Pandas',
        'Build and evaluate Supervised Machine Learning models'
      ],
      requirements: ['No prior programming experience required.']
    });

    const c3_sec1 = await Section.create({
      courseId: course3._id,
      title: 'Module 1: Python Data Structures & NumPy Essentials',
      description: 'Fast mathematical computing in Python.',
      order: 1
    });

    const c3_l1 = await Lesson.create({
      sectionId: c3_sec1._id,
      courseId: course3._id,
      title: '1.1 Introduction to NumPy Array Operations',
      type: 'video',
      order: 1,
      durationMinutes: 14,
      isFreePreview: true,
      content: {
        videoUrl: 'https://www.youtube.com/watch?v=7eh4d6sabA0',
        articleBody: 'NumPy arrays vs Python lists: Speed, memory layout, and vectorized computation.'
      }
    });

    c3_sec1.lessons = [c3_l1._id];
    await c3_sec1.save();
    course3.sections = [c3_sec1._id];
    await course3.save();

    // 4. Course 4: Cloud & DevOps Masterclass (Docker, Kubernetes, AWS)

    const course4 = await Course.create({
      title: 'Docker & Kubernetes: Cloud DevOps Engineering Bootcamp',
      subtitle: 'Master containerization, orchestration, CI/CD pipelines, and AWS deployment.',
      slug: 'docker-kubernetes-cloud-devops-bootcamp',
      description: 'Go from zero to cloud DevOps engineer. Learn how to containerize microservices with Docker, manage multi-node clusters with Kubernetes (K8s), write Helm charts, configure automated GitHub Actions CI/CD workflows, and deploy resilient architectures on AWS EKS.',
      instructorId: instructor1._id,
      category: 'Cloud & DevOps',
      subcategory: 'DevOps',
      level: 'intermediate',
      price: 94.99,
      discount: 15,
      durationHours: 20.0,
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      previewVideoUrl: 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
      rating: 4.95,
      reviewCount: 215,
      enrollmentCount: 890,
      isFeatured: true,
      status: 'published',
      objectives: [
        'Build multi-stage production Dockerfiles and optimize image layers',
        'Deploy and scale resilient Kubernetes Deployments, Services, and Ingress',
        'Build automated CI/CD deployment pipelines with GitHub Actions',
        'Monitor cloud workloads with Prometheus and Grafana'
      ],
      requirements: ['Basic Linux terminal familiarity and web development fundamentals.']
    });

    const c4_sec1 = await Section.create({
      courseId: course4._id,
      title: 'Module 1: Docker Architecture & Containerization',
      description: 'Images, containers, multi-stage builds, and Docker Compose.',
      order: 1
    });

    const c4_l1 = await Lesson.create({
      sectionId: c4_sec1._id,
      courseId: course4._id,
      title: '1.1 Deep Dive: Docker Engine, Images & Layer Caching',
      type: 'video',
      order: 1,
      durationMinutes: 20,
      isFreePreview: true,
      content: {
        videoUrl: 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
        articleBody: `### Docker Internals & Container Isolation
Containers leverage Linux cgroups and namespaces to achieve process-level isolation with near-zero overhead compared to traditional VMs.`
      }
    });

    const c4_l2 = await Lesson.create({
      sectionId: c4_sec1._id,
      courseId: course4._id,
      title: '1.2 Kubernetes Pods, Deployments & Cluster Architecture',
      type: 'video',
      order: 2,
      durationMinutes: 28,
      content: {
        videoUrl: 'https://www.youtube.com/watch?v=X48VuDVv0do',
        articleBody: `### Kubernetes Cluster Anatomy
Learn how the Control Plane (API server, etcd, scheduler, controller manager) orchestrates Worker Nodes running kubelet and container runtimes.`
      }
    });

    const c4_quiz = await Quiz.create({
      courseId: course4._id,
      sectionId: c4_sec1._id,
      title: 'DevOps & Containerization Knowledge Check',
      description: 'Test your understanding of Docker layers, Kubernetes pods, and ingress.',
      timeLimitMinutes: 10,
      passingScorePercent: 70,
      questions: [
        {
          question: 'Why are multi-stage Docker builds recommended for production images?',
          type: 'mcq',
          options: [
            'They drastically reduce image size by excluding build-time tools from the final image',
            'They bypass Linux kernel security',
            'They convert node code to machine assembly',
            'They force the container to run without RAM'
          ],
          correctAnswer: 'They drastically reduce image size by excluding build-time tools from the final image',
          explanation: 'Multi-stage builds allow compiling in an SDK image and copying only runtime artifacts to a minimal base.',
          points: 10,
          order: 1
        }
      ]
    });

    c4_sec1.lessons = [c4_l1._id, c4_l2._id];
    c4_sec1.quizId = c4_quiz._id;
    await c4_sec1.save();
    course4.sections = [c4_sec1._id];
    await course4.save();

    // 5. Course 5: Data Structures & Algorithms (DSA)
    const course5 = await Course.create({
      title: 'Data Structures & Algorithms: The Technical Interview Masterclass',
      subtitle: 'Ace coding interviews at FAANG and tier-1 tech companies with hands-on problem solving.',
      slug: 'data-structures-algorithms-interview-masterclass',
      description: 'Master time & space complexity (Big-O), arrays, hash maps, linked lists, binary search trees, dynamic programming, backtracking, and graph algorithms. Includes step-by-step video solutions to the top 100 most frequent technical interview questions.',
      instructorId: instructor1._id,
      category: 'Web Development',
      subcategory: 'Computer Science',
      level: 'intermediate',
      price: 79.99,
      discount: 25,
      durationHours: 24.0,
      thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80',
      previewVideoUrl: 'https://www.youtube.com/watch?v=8hly31xKli0',
      rating: 4.92,
      reviewCount: 420,
      enrollmentCount: 1680,
      isFeatured: true,
      status: 'published',
      objectives: [
        'Analyze any algorithm with Big-O Time & Space complexity notation',
        'Solve dynamic programming, memoization, and tabulation problems confidently',
        'Implement BFS, DFS, Dijkstra, and Topological Sort on Graphs',
        'Ace technical coding rounds at top tech companies'
      ],
      requirements: ['Basic programming knowledge in any language (JavaScript, Python, Java, or C++).']
    });

    const c5_sec1 = await Section.create({
      courseId: course5._id,
      title: 'Module 1: Big-O Mastery & Dynamic Programming',
      description: 'Asymptotic complexity and optimal subproblem recursion.',
      order: 1
    });

    const c5_l1 = await Lesson.create({
      sectionId: c5_sec1._id,
      courseId: course5._id,
      title: '1.1 Asymptotic Analysis & Graph Traversal Patterns',
      type: 'video',
      order: 1,
      durationMinutes: 22,
      isFreePreview: true,
      content: {
        videoUrl: 'https://www.youtube.com/watch?v=8hly31xKli0',
        articleBody: 'Understanding worst-case Big-O, amortized time complexity, and BFS/DFS graph traversals.'
      }
    });

    c5_sec1.lessons = [c5_l1._id];
    await c5_sec1.save();
    course5.sections = [c5_sec1._id];
    await course5.save();

    // 6. Course 6: Cybersecurity & Ethical Hacking
    const course6 = await Course.create({
      title: 'Cybersecurity, Ethical Hacking & Network Defense Bootcamp',
      subtitle: 'Hands-on penetration testing, vulnerability assessment, and OWASP Top 10 web defense.',
      slug: 'cybersecurity-ethical-hacking-network-defense',
      description: 'Learn the techniques of certified ethical hackers and security researchers. Explore Kali Linux tools, network traffic analysis with Wireshark, SQL injection exploitation and prevention, cross-site scripting (XSS), cryptanalysis, and enterprise threat mitigation.',
      instructorId: instructor2._id,
      category: 'Cybersecurity',
      subcategory: 'Security',
      level: 'all_levels',
      price: 0, // Free course
      durationHours: 16.5,
      thumbnail: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=1200&q=80',
      previewVideoUrl: 'https://www.youtube.com/watch?v=3Kq1MIfTWCE',
      rating: 4.88,
      reviewCount: 185,
      enrollmentCount: 940,
      isFeatured: false,
      status: 'published',
      objectives: [
        'Understand networking protocols (TCP/IP, DNS, TLS, ARP) and packet sniffing',
        'Identify and remediate OWASP Top 10 vulnerabilities in modern web applications',
        'Perform ethical penetration tests in sandboxed security environments'
      ],
      requirements: ['Basic computer networking fundamentals.']
    });

    const c6_sec1 = await Section.create({
      courseId: course6._id,
      title: 'Module 1: Network Reconnaissance & Vulnerability Scanning',
      description: 'Port scanning, Wireshark packet capture, and security hardening.',
      order: 1
    });

    const c6_l1 = await Lesson.create({
      sectionId: c6_sec1._id,
      courseId: course6._id,
      title: '1.1 Fundamentals of Cybersecurity & Threat Models',
      type: 'video',
      order: 1,
      durationMinutes: 18,
      isFreePreview: true,
      content: {
        videoUrl: 'https://www.youtube.com/watch?v=3Kq1MIfTWCE',
        articleBody: 'Understanding the CIA triad (Confidentiality, Integrity, Availability) and zero-trust security.'
      }
    });

    c6_sec1.lessons = [c6_l1._id];
    await c6_sec1.save();
    course6.sections = [c6_sec1._id];
    await course6.save();

    // 7. Course 7: Generative AI & LLM Engineering with Python
    const course7 = await Course.create({
      title: 'Generative AI & LLM Application Engineering with Python & LangChain',
      subtitle: 'Build intelligent AI agents, RAG pipelines, semantic search, and vector embeddings.',
      slug: 'generative-ai-llm-application-engineering',
      description: 'Harness the cutting edge of AI. Build production-ready generative AI applications using Python, LangChain, LlamaIndex, Pinecone vector database, and state-of-the-art Large Language Models. Learn prompt engineering, function calling, Retrieval-Augmented Generation (RAG), and autonomous AI agent loops.',
      instructorId: instructor1._id,
      category: 'Data Science & AI',
      subcategory: 'Generative AI',
      level: 'intermediate',
      price: 99.99,
      discount: 20,
      durationHours: 21.0,
      thumbnail: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=80',
      previewVideoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
      rating: 4.97,
      reviewCount: 320,
      enrollmentCount: 1240,
      isFeatured: true,
      status: 'published',
      objectives: [
        'Architect and deploy high-accuracy Retrieval-Augmented Generation (RAG) systems',
        'Store and query semantic embeddings in vector databases (Pinecone / ChromaDB)',
        'Build autonomous AI agents with tools, memory, and multi-step reasoning chains'
      ],
      requirements: ['Basic Python experience.']
    });

    const c7_sec1 = await Section.create({
      courseId: course7._id,
      title: 'Module 1: LLM Foundations, Prompt Engineering & Embeddings',
      description: 'Understanding attention mechanisms and vector mathematics.',
      order: 1
    });

    const c7_l1 = await Lesson.create({
      sectionId: c7_sec1._id,
      courseId: course7._id,
      title: '1.1 Architecture of Modern LLMs & Transformer Models',
      type: 'video',
      order: 1,
      durationMinutes: 25,
      isFreePreview: true,
      content: {
        videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
        articleBody: 'Deep dive into tokenization, context windows, vector cosine similarity, and RAG pipelines.'
      }
    });

    c7_sec1.lessons = [c7_l1._id];
    await c7_sec1.save();
    course7.sections = [c7_sec1._id];
    await course7.save();

    // 8. Enrollments & Progress for Alex Rivera (student1)
    // 1. Completed Course 1 (MERN) with Certificate
    const certNum = `CERT-2026-MERN99`;
    const cert1 = await Certificate.create({
      certificateNumber: certNum,
      studentId: student1._id,
      courseId: course1._id,
      studentName: `${student1.firstName} ${student1.lastName}`,
      courseTitle: course1.title,
      instructorName: `${instructor1.firstName} ${instructor1.lastName}`,
      gradePercent: 98,
      honorLevel: 'Honors',
      issueDate: new Date('2026-03-15'),
      isVerified: true
    });

    await Enrollment.create({
      studentId: student1._id,
      courseId: course1._id,
      progressPercent: 100,
      completedLessons: [c1_l1._id, c1_l2._id, c1_l3._id],
      completedQuizzes: [{ quizId: c1_quiz._id, score: 100, passed: true }],
      status: 'completed',
      certificateIssued: true,
      certificateId: cert1._id,
      lastAccessedLesson: c1_l3._id,
      totalTimeSpentSeconds: 14200,
      completedAt: new Date('2026-03-15')
    });

    // 2. Active Course 4: Docker & Kubernetes (75% Progress)
    await Enrollment.create({
      studentId: student1._id,
      courseId: course4._id,
      progressPercent: 75,
      completedLessons: [c4_l1._id],
      completedQuizzes: [{ quizId: c4_quiz._id, score: 90, passed: true }],
      status: 'active',
      lastAccessedLesson: c4_l2._id,
      totalTimeSpentSeconds: 8600
    });

    // 3. Active Course 5: DSA Masterclass (50% Progress)
    await Enrollment.create({
      studentId: student1._id,
      courseId: course5._id,
      progressPercent: 50,
      completedLessons: [c5_l1._id],
      status: 'active',
      lastAccessedLesson: c5_l1._id,
      totalTimeSpentSeconds: 5400
    });

    // 4. Active Course 3: Python Data Science & ML (40% Progress)
    await Enrollment.create({
      studentId: student1._id,
      courseId: course3._id,
      progressPercent: 40,
      completedLessons: [c3_l1._id],
      status: 'active',
      lastAccessedLesson: c3_l1._id,
      totalTimeSpentSeconds: 4200
    });

    // 5. Active Course 2: UI/UX Design Systems (60% Progress)
    await Enrollment.create({
      studentId: student1._id,
      courseId: course2._id,
      progressPercent: 60,
      completedLessons: [c2_l1._id],
      status: 'active',
      lastAccessedLesson: c2_l1._id,
      totalTimeSpentSeconds: 4800
    });

    // 6. Active Course 7: Generative AI & LLMs (20% Progress)
    await Enrollment.create({
      studentId: student1._id,
      courseId: course7._id,
      progressPercent: 20,
      completedLessons: [],
      status: 'active',
      lastAccessedLesson: c7_l1._id,
      totalTimeSpentSeconds: 1800
    });

    // Student 2 (Emma) enrolled in Course 3 & 6
    await Enrollment.create({
      studentId: student2._id,
      courseId: course3._id,
      progressPercent: 33,
      completedLessons: [c3_l1._id],
      status: 'active',
      lastAccessedLesson: c3_l1._id,
      totalTimeSpentSeconds: 2400
    });

    await Enrollment.create({
      studentId: student2._id,
      courseId: course6._id,
      progressPercent: 50,
      completedLessons: [c6_l1._id],
      status: 'active',
      lastAccessedLesson: c6_l1._id,
      totalTimeSpentSeconds: 3200
    });

    // 5. Assignment Submissions
    await AssignmentSubmission.create({
      assignmentId: c1_assignment._id,
      courseId: course1._id,
      studentId: student1._id,
      submissionType: 'url',
      projectUrl: 'https://github.com/alexrivera/mern-jwt-auth-system',
      notes: 'Implemented secure JWT with access and refresh tokens, bcrypt salt rounds of 12, and automatic cookie handling.',
      status: 'graded',
      grade: 98,
      feedback: 'Outstanding implementation Alex! Clean middleware architecture, proper error trapping, and secure secret handling.',
      gradedBy: instructor1._id,
      gradedAt: new Date('2026-03-14')
    });

    // 6. Discussions
    const disc1 = await Discussion.create({
      courseId: course1._id,
      lessonId: c1_l1._id,
      userId: student1._id,
      title: 'Best practice for storing JWT tokens in Single Page Apps?',
      content: 'Should we store JWTs in localStorage or in httpOnly secure cookies to safeguard against XSS attacks?',
      category: 'Question',
      isPinned: true,
      isResolved: true,
      views: 45,
      likes: [instructor1._id, student2._id],
      replies: [
        {
          userId: instructor1._id,
          content: 'Great question Alex! In modern web security, storing short-lived access tokens in memory (or secure httpOnly cookies with SameSite=Strict) and refresh tokens in httpOnly cookies offers the best defense against XSS token harvesting.',
          isInstructorAnswer: true,
          isAcceptedSolution: true,
          createdAt: new Date()
        }
      ]
    });

    console.log('✅ Database successfully seeded with 7 rich courses, video lessons, quizzes, assignments, certificates, and student enrollments!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();

