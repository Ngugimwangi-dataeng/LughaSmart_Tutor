export type UserRole = 'student' | 'tutor';
export type AudienceSection = 'adult' | 'children';
export type LanguageCategory = 'kenyan' | 'foreign';
export type PlanType = 'per_session' | 'monthly_pass';
export type PaymentMethod = 'mpesa' | 'visa';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  isAdmin?: boolean;
  isSuspended?: boolean;
  adminPin?: string;
  createdAt: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: string;
  endpoint: string;
  action: string;
  httpStatus: number;
  details: string;
}

export interface CourseModule {
  id: string;
  title: string;
  summary: string;
}

export interface Course {
  id: string;
  title: string;
  languageName: string;
  category: LanguageCategory;
  audience: AudienceSection;
  sessionDurationMinutes: number; // 180 for adult, 60 for children
  description: string;
  level: string;
  perSessionPriceKes: number;
  monthlyPassPriceKes: number; // Discounted unlimited monthly pass
  jitsiRoomName: string;
  pdfTitle: string;
  tutorName: string;
  tutorUid: string;
  imageUrl: string;
  lessonsCount: number;
  modules: CourseModule[];
}

export interface Enrollment {
  id: string;
  studentUid: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  languageName: string;
  audience: AudienceSection;
  planType: PlanType;
  amountKes: number;
  paymentMethod: PaymentMethod;
  transactionRef: string;
  paymentStatus: 'completed' | 'pending' | 'revoked';
  jitsiRoomUrl: string;
  preferredSlot: string;
  isReadyForClass: boolean;
  modulesCompletedCount: number;
  totalModules: number;
  completedModuleIds: string[];
  testScoreAvg: number;
  enrolledAt: string;
  updatedAt: string;
}

export interface DailyLiveSession {
  id: string;
  courseId: string;
  languageName: string;
  audience: AudienceSection;
  sessionDate: string; // YYYY-MM-DD
  startTimeEat: string;
  endTimeEat: string;
  topic: string;
  jitsiRoomUrl: string;
  status: 'scheduled' | 'live_now' | 'completed';
  tutorName: string;
  updatedAt: string;
}

export interface ClassEmailNotification {
  id: string;
  courseId: string;
  languageName: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  messageBody: string;
  classTimeInfo: string;
  sentByName: string;
  sentAt: string;
}

export interface SharedMaterial {
  id: string;
  courseId: string;
  languageName: string;
  materialType: 'pdf' | 'audio' | 'image';
  title: string;
  description: string;
  fileName: string;
  mediaUrl: string;
  durationLabel?: string;
  tutorUid: string;
  tutorName: string;
  createdAt: string;
}

export interface TestQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface LanguageTest {
  id: string;
  courseId: string;
  languageName: string;
  audience: AudienceSection;
  title: string;
  description: string;
  questions: TestQuestion[];
  tutorUid: string;
  createdAt: string;
}

export interface TestSubmission {
  id: string;
  testId: string;
  testTitle: string;
  courseId: string;
  languageName: string;
  studentUid: string;
  studentName: string;
  scorePercent: number;
  correctCount: number;
  totalCount: number;
  submittedAt: string;
}

export interface AudioSubmission {
  id: string;
  studentUid: string;
  studentName: string;
  courseId: string;
  language: string;
  phrase: string;
  accuracyScore: number;
  tutorFeedback: string;
  submittedAt: string;
  updatedAt: string;
}

export interface TutorRating {
  id: string;
  studentUid: string;
  studentName: string;
  courseId: string;
  languageName: string;
  tutorName: string;
  rating: number;
  satisfactionLevel: 'Very Satisfied' | 'Satisfied' | 'Neutral' | 'Needs Improvement';
  comment: string;
  createdAt: string;
}

export interface WordGameScore {
  id: string;
  studentUid: string;
  studentName: string;
  languageName: string;
  score: number;
  pairsMatched: number;
  playedAt: string;
}
