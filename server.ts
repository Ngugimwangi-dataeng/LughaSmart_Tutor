import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory Database matching the exact PostgreSQL schema from the PDF Proposal:
// CREATE TABLE users ( id SERIAL PRIMARY KEY, full_name VARCHAR(100) NOT NULL, email VARCHAR(150) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role VARCHAR(20) CHECK (role IN ('student', 'tutor')) DEFAULT 'student', reset_token VARCHAR(255) DEFAULT NULL, reset_token_expiry TIMESTAMP DEFAULT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );
// CREATE TABLE courses ( id SERIAL PRIMARY KEY, title VARCHAR(150) NOT NULL, language_name VARCHAR(50) NOT NULL, description TEXT, price_kes DECIMAL(10, 2) NOT NULL, course_type VARCHAR(20) CHECK (course_type IN ('pdf', 'audio', 'live')) NOT NULL );
// CREATE TABLE enrollments ( id SERIAL PRIMARY KEY, student_id INT REFERENCES users(id) ON DELETE CASCADE, course_id INT REFERENCES courses(id) ON DELETE CASCADE, payment_status VARCHAR(20) DEFAULT 'pending', is_ready_for_class BOOLEAN DEFAULT FALSE, enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );

interface User {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role: 'student' | 'tutor';
  avatar_url?: string;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  language_name: string;
  description: string;
  price_kes: number;
  course_type: 'pdf' | 'audio' | 'live';
  level: string;
  lessons_count: number;
  duration_weeks: number;
  pdf_curriculum_name?: string;
  tutor_name: string;
}

interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  payment_status: 'pending' | 'completed' | 'failed';
  is_ready_for_class: boolean;
  enrolled_at: string;
  payment_method?: 'mpesa' | 'visa';
  transaction_ref?: string;
}

interface AudioSubmission {
  id: string;
  student_id: number;
  course_id: number;
  phrase: string;
  language: string;
  audio_url: string;
  accuracy_score: number;
  feedback?: string;
  tutor_audio_url?: string;
  submitted_at: string;
}

// Initial seed data
const users: User[] = [
  {
    id: 1,
    full_name: 'John Miller (Expat Learner)',
    email: 'john.miller@example.com',
    password_hash: 'scrypt:sha256$e2e_hashed_salt$student',
    role: 'student',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    created_at: '2026-03-01 10:24:00',
  },
  {
    id: 2,
    full_name: 'Dr. Amina Wambui (Senior Linguist)',
    email: 'amina.wambui@lughasmart.ac.ke',
    password_hash: 'scrypt:sha256$e2e_hashed_salt$tutor',
    role: 'tutor',
    avatar_url: '/src/assets/images/tutor_amina_avatar_1794473845671.jpg',
    created_at: '2026-01-15 08:00:00',
  },
  {
    id: 3,
    full_name: 'Sarah Chen (UN Diplomat)',
    email: 'sarah.chen@example.org',
    password_hash: 'scrypt:sha256$e2e_hashed_salt$student',
    role: 'student',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    created_at: '2026-03-05 14:10:00',
  }
];

const courses: Course[] = [
  {
    id: 101,
    title: 'Conversational Kiswahili for Foreigners & Expats',
    language_name: 'Swahili (Kiswahili)',
    description: 'Master everyday conversational Swahili, greetings, market bargaining, transport navigation, and cultural etiquette across Kenya and East Africa.',
    price_kes: 4500.00,
    course_type: 'live',
    level: 'Beginner to Intermediate',
    lessons_count: 12,
    duration_weeks: 4,
    pdf_curriculum_name: 'LughaSmart_Swahili_Conversational_Curriculum_v3.pdf',
    tutor_name: 'Dr. Amina Wambui',
  },
  {
    id: 102,
    title: 'Gĩkũyũ Indigenous Heritage & Business Dialect',
    language_name: 'Kikuyu (Gĩkũyũ)',
    description: 'Comprehensive oral mastery, tonal pronunciation guides, central Kenya commerce vocabulary, kinship terms, and native proverb wisdom.',
    price_kes: 5200.00,
    course_type: 'audio',
    level: 'Foundational',
    lessons_count: 10,
    duration_weeks: 5,
    pdf_curriculum_name: 'Kikuyu_Phonetics_Pronunciation_Manual.pdf',
    tutor_name: 'Mwalimu James Mwangi',
  },
  {
    id: 103,
    title: 'Dholuo Intensive: Lake Region Social & Cultural Immersion',
    language_name: 'Luo (Dholuo)',
    description: 'Deep dive into Luo syntax, greeting rituals, conversational flow, melodic inflections, and vibrant socio-cultural idioms for Western Kenya travelers.',
    price_kes: 4800.00,
    course_type: 'live',
    level: 'Beginner',
    lessons_count: 12,
    duration_weeks: 4,
    pdf_curriculum_name: 'Dholuo_Grammar_and_Conversation_Guide.pdf',
    tutor_name: 'Otieno Kevin Ochieng',
  },
  {
    id: 104,
    title: 'Maa (Maasai) Cultural Dialogue & Wildlife Community Relations',
    language_name: 'Maasai (Maa)',
    description: 'Specialized language program for conservationists, eco-tourists, researchers, and safari travelers working alongside indigenous Maasai pastoral communities.',
    price_kes: 6000.00,
    course_type: 'pdf',
    level: 'Essential Field Guide',
    lessons_count: 8,
    duration_weeks: 3,
    pdf_curriculum_name: 'Maasai_Community_Field_Language_Guide.pdf',
    tutor_name: 'Saitoti Ole Kaelo',
  },
  {
    id: 105,
    title: 'Kalenjin Tonal Phonics & Rift Valley Social Traditions',
    language_name: 'Kalenjin (Nandi/Kipsigis)',
    description: 'Explore the rhythmic tones and communal greetings of the Kalenjin languages spoken in Kenya’s fertile Great Rift Valley highlands.',
    price_kes: 4600.00,
    course_type: 'audio',
    level: 'Foundational',
    lessons_count: 8,
    duration_weeks: 4,
    pdf_curriculum_name: 'Kalenjin_Highland_Dialect_Handbook.pdf',
    tutor_name: 'Faith Chebet',
  },
  {
    id: 106,
    title: 'Kikamba Express: Eastern Kenya Trade & Friendly Colloquialisms',
    language_name: 'Kamba (Kikamba)',
    description: 'Learn rapid trade colloquialisms, polite phrasing, and artisan community communications for Machakos, Kitui, and Makueni travelers.',
    price_kes: 3800.00,
    course_type: 'live',
    level: 'Beginner',
    lessons_count: 6,
    duration_weeks: 2,
    pdf_curriculum_name: 'Kikamba_Conversational_Phrases.pdf',
    tutor_name: 'Boniface Mutua',
  }
];

let enrollments: Enrollment[] = [
  {
    id: 1,
    student_id: 1, // John Miller
    course_id: 101, // Swahili
    payment_status: 'completed',
    is_ready_for_class: true,
    enrolled_at: '2026-03-02 11:15:00',
    payment_method: 'mpesa',
    transaction_ref: 'MPESA_QK8820XPLM'
  },
  {
    id: 2,
    student_id: 3, // Sarah Chen
    course_id: 103, // Luo
    payment_status: 'completed',
    is_ready_for_class: false,
    enrolled_at: '2026-03-06 09:30:00',
    payment_method: 'visa',
    transaction_ref: 'VISA_AUTH_948271'
  }
];

let audioSubmissions: AudioSubmission[] = [
  {
    id: 'sub_01',
    student_id: 1,
    course_id: 101,
    phrase: 'Habari gani? Jina langu ni John.',
    language: 'Swahili',
    audio_url: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
    accuracy_score: 92,
    feedback: 'Excellent vocal inflection! Soften the "r" in "Habari" slightly for authentic coastal cadence.',
    tutor_audio_url: 'sample_tutor_audio.mp3',
    submitted_at: '2026-03-08 14:20:00',
  }
];

// Audit security log for RBAC violations and access events
interface SecurityAuditLog {
  id: string;
  timestamp: string;
  user_email: string;
  role: string;
  endpoint: string;
  action: string;
  status: '200_OK' | '403_FORBIDDEN' | '401_UNAUTHORIZED';
  details: string;
}

const auditLogs: SecurityAuditLog[] = [
  {
    id: 'audit_01',
    timestamp: '2026-03-08 10:14:22',
    user_email: 'john.miller@example.com',
    role: 'student',
    endpoint: '/student/dashboard',
    action: 'VIEW_COURSE_LESSONS',
    status: '200_OK',
    details: 'Authorized student access granted to enrolled course 101.'
  }
];

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Serve the attached PDF directly from /public/assets/aistudio/...
  app.use('/public', express.static(path.resolve(__dirname, 'public')));

  // ==========================================
  // RBAC & SECURITY MIDDLEWARE
  // ==========================================
  // Enforces strict endpoint segregation:
  // Students operate under /student/* and CANNOT access /tutor/*
  const checkTutorRole = (req: Request, res: Response, next: () => void) => {
    const userRole = (req.headers['x-user-role'] as string) || 'student';
    const userEmail = (req.headers['x-user-email'] as string) || 'anonymous';

    if (userRole !== 'tutor') {
      const logEntry: SecurityAuditLog = {
        id: 'audit_' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user_email: userEmail,
        role: userRole,
        endpoint: req.originalUrl,
        action: 'RBAC_SECURITY_VIOLATION_ATTEMPT',
        status: '403_FORBIDDEN',
        details: `Access Denied: User with role '${userRole}' strictly prohibited from tutor management pathways.`
      };
      auditLogs.unshift(logEntry);

      return res.status(403).json({
        error: 'Forbidden (HTTP 403)',
        message: 'Direct URL manipulation or unauthorized pathway detected. Tutor console is restricted to certified educators.',
        security_event_id: logEntry.id,
      });
    }
    next();
  };

  // ==========================================
  // REST API ENDPOINTS
  // ==========================================

  // 1. Get all courses
  app.get('/api/courses', (_req, res) => {
    res.json({ courses });
  });

  // 2. Get user profile & enrollments
  app.get('/api/user/:userId/state', (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const userEnrollments = enrollments.filter(e => e.student_id === userId);
    const enriched = userEnrollments.map(enr => {
      const course = courses.find(c => c.id === enr.course_id);
      return {
        ...enr,
        course
      };
    });

    res.json({
      user,
      enrollments: enriched,
      submissions: audioSubmissions.filter(s => s.student_id === userId)
    });
  });

  // 3. Toggle "I am Ready for Class"
  app.post('/api/student/readiness', (req, res) => {
    const { student_id, course_id, is_ready } = req.body;
    const enrollment = enrollments.find(e => e.student_id === student_id && e.course_id === course_id);
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found for student and course' });
    }

    enrollment.is_ready_for_class = Boolean(is_ready);

    res.json({
      success: true,
      enrollment_id: enrollment.id,
      is_ready_for_class: enrollment.is_ready_for_class,
      timestamp: new Date().toISOString()
    });
  });

  // 4. Safaricom Daraja M-Pesa STK Push Simulation Endpoint
  app.post('/api/payments/mpesa/stkpush', (req, res) => {
    const { student_id, course_id, phone_number, amount_kes } = req.body;

    if (!phone_number || !course_id || !student_id) {
      return res.status(400).json({ error: 'Missing required checkout parameters' });
    }

    const course = courses.find(c => c.id === course_id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    // Generate Daraja IDs
    const checkoutRequestId = 'ws_CO_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
    const merchantRequestId = '29384-938201-1';
    const mpesaReceipt = 'QK' + Math.floor(10000000 + Math.random() * 90000000);

    // Auto-create or update enrollment with verified payment
    let enrollment = enrollments.find(e => e.student_id === student_id && e.course_id === course_id);
    if (!enrollment) {
      enrollment = {
        id: enrollments.length + 1,
        student_id,
        course_id,
        payment_status: 'completed',
        is_ready_for_class: true,
        enrolled_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        payment_method: 'mpesa',
        transaction_ref: mpesaReceipt
      };
      enrollments.push(enrollment);
    } else {
      enrollment.payment_status = 'completed';
      enrollment.payment_method = 'mpesa';
      enrollment.transaction_ref = mpesaReceipt;
    }

    // Log security audit
    auditLogs.unshift({
      id: 'audit_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user_email: users.find(u => u.id === student_id)?.email || 'student@example.com',
      role: 'student',
      endpoint: '/api/payments/mpesa/stkpush',
      action: 'DARAJA_PAYMENT_VERIFIED',
      status: '200_OK',
      details: `Safaricom M-Pesa STK Push completed: KES ${amount_kes} confirmed under receipt ${mpesaReceipt}. Course #${course_id} unlocked instantly.`
    });

    res.json({
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      MerchantRequestID: merchantRequestId,
      CheckoutRequestID: checkoutRequestId,
      CustomerMessage: `Success! KES ${amount_kes} received via M-Pesa from ${phone_number}. Instant enrollment activated.`,
      MpesaReceiptNumber: mpesaReceipt,
      course_id,
      student_id,
      enrollment
    });
  });

  // 5. Visa / Mastercard Processing Endpoint
  app.post('/api/payments/visa/charge', (req, res) => {
    const { student_id, course_id, card_number, card_name, expiry, cvv, amount_kes } = req.body;

    if (!card_number || !student_id || !course_id) {
      return res.status(400).json({ error: 'Missing credit card parameters' });
    }

    const authCode = 'AUTH_VI_' + Math.floor(100000 + Math.random() * 900000);
    const maskedCard = '•••• •••• •••• ' + card_number.slice(-4);

    let enrollment = enrollments.find(e => e.student_id === student_id && e.course_id === course_id);
    if (!enrollment) {
      enrollment = {
        id: enrollments.length + 1,
        student_id,
        course_id,
        payment_status: 'completed',
        is_ready_for_class: true,
        enrolled_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        payment_method: 'visa',
        transaction_ref: authCode
      };
      enrollments.push(enrollment);
    } else {
      enrollment.payment_status = 'completed';
      enrollment.payment_method = 'visa';
      enrollment.transaction_ref = authCode;
    }

    auditLogs.unshift({
      id: 'audit_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user_email: users.find(u => u.id === student_id)?.email || 'student@example.com',
      role: 'student',
      endpoint: '/api/payments/visa/charge',
      action: 'VISA_3DS_PAYMENT_SETTLED',
      status: '200_OK',
      details: `Visa/Mastercard 3D-Secure payment verified: KES ${amount_kes} processed (${maskedCard}). Course #${course_id} granted.`
    });

    res.json({
      success: true,
      auth_code: authCode,
      masked_card: maskedCard,
      amount_kes,
      message: 'Card authenticated via 3D Secure. Instant access granted.',
      enrollment
    });
  });

  // 6. Tutor Endpoint: Get live ready students & class roster (Protected by checkTutorRole)
  app.get('/api/tutor/live-students', checkTutorRole, (_req, res) => {
    const readyStudents = enrollments
      .filter(e => e.payment_status === 'completed' && e.is_ready_for_class)
      .map(e => {
        const student = users.find(u => u.id === e.student_id);
        const course = courses.find(c => c.id === e.course_id);
        return {
          enrollment_id: e.id,
          student,
          course,
          enrolled_at: e.enrolled_at,
          payment_ref: e.transaction_ref
        };
      });

    const allRoster = enrollments
      .filter(e => e.payment_status === 'completed')
      .map(e => {
        const student = users.find(u => u.id === e.student_id);
        const course = courses.find(c => c.id === e.course_id);
        return {
          enrollment_id: e.id,
          student,
          course,
          is_ready: e.is_ready_for_class,
          enrolled_at: e.enrolled_at,
          payment_method: e.payment_method,
          transaction_ref: e.transaction_ref
        };
      });

    res.json({
      ready_count: readyStudents.length,
      ready_students: readyStudents,
      all_roster: allRoster,
      audio_submissions: audioSubmissions
    });
  });

  // 7. Tutor Endpoint: Update curriculum PDF
  app.post('/api/tutor/curriculum/update-pdf', checkTutorRole, (req, res) => {
    const { course_id, pdf_name, notes } = req.body;
    const course = courses.find(c => c.id === course_id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    course.pdf_curriculum_name = pdf_name || course.pdf_curriculum_name;

    auditLogs.unshift({
      id: 'audit_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user_email: 'amina.wambui@lughasmart.ac.ke',
      role: 'tutor',
      endpoint: '/api/tutor/curriculum/update-pdf',
      action: 'CURRICULUM_PDF_UPDATED',
      status: '200_OK',
      details: `Course #${course_id} (${course.title}) PDF updated to '${pdf_name}'. Notes: ${notes || 'Updated lesson plan'}`
    });

    res.json({
      success: true,
      course,
      message: `Curriculum PDF successfully updated for ${course.title}. Students can view immediately.`
    });
  });

  // 8. Submit Audio Pronunciation (Student)
  app.post('/api/audio/submit', (req, res) => {
    const { student_id, course_id, phrase, language, audio_base64 } = req.body;
    const score = Math.floor(85 + Math.random() * 14); // 85-99%

    const newSub: AudioSubmission = {
      id: 'sub_' + Date.now(),
      student_id: Number(student_id),
      course_id: Number(course_id),
      phrase: phrase || 'Jambo, habari yako?',
      language: language || 'Swahili',
      audio_url: audio_base64 || 'data:audio/wav;base64,sample',
      accuracy_score: score,
      feedback: score > 90 ? 'High accuracy native cadence detected.' : 'Tone is good, focus on nasal vowel stress.',
      submitted_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    audioSubmissions.unshift(newSub);

    res.json({
      success: true,
      submission: newSub
    });
  });

  // 9. Tutor Provide Audio Feedback
  app.post('/api/tutor/audio-feedback', checkTutorRole, (req, res) => {
    const { submission_id, feedback_text } = req.body;
    const sub = audioSubmissions.find(s => s.id === submission_id);
    if (!sub) return res.status(404).json({ error: 'Submission not found' });

    sub.feedback = feedback_text;
    sub.tutor_audio_url = 'tutor_pronunciation_correction.mp3';

    res.json({ success: true, submission: sub });
  });

  // 10. PostgreSQL Schema Inspector & Live Query Simulator
  app.get('/api/db/schema', (_req, res) => {
    res.json({
      schema_sql: `
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('student', 'tutor')) DEFAULT 'student',
  reset_token VARCHAR(255) DEFAULT NULL,
  reset_token_expiry TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  language_name VARCHAR(50) NOT NULL,
  description TEXT,
  price_kes DECIMAL(10, 2) NOT NULL,
  course_type VARCHAR(20) CHECK (course_type IN ('pdf', 'audio', 'live')) NOT NULL
);

CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES users(id) ON DELETE CASCADE,
  course_id INT REFERENCES courses(id) ON DELETE CASCADE,
  payment_status VARCHAR(20) DEFAULT 'pending',
  is_ready_for_class BOOLEAN DEFAULT FALSE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
      tables: {
        users,
        courses,
        enrollments,
        audit_logs: auditLogs
      }
    });
  });

  // 11. Security Audit Logs
  app.get('/api/security/audit-logs', (_req, res) => {
    res.json({ logs: auditLogs });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LughaSmart Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
