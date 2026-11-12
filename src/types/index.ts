export type UserRole = 'student' | 'tutor';

export interface User {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export type CourseType = 'pdf' | 'audio' | 'live';

export interface LessonModule {
  id: string;
  title: string;
  duration_minutes: number;
  completed: boolean;
  type: CourseType;
  description: string;
  key_phrases?: {
    original: string;
    phonetic: string;
    english: string;
    audio_sample?: string;
  }[];
}

export interface Course {
  id: number;
  title: string;
  language_name: string;
  description: string;
  price_kes: number;
  course_type: CourseType;
  level: string;
  lessons_count: number;
  duration_weeks: number;
  pdf_curriculum_name?: string;
  tutor_name: string;
  rating?: number;
  students_enrolled?: number;
  modules?: LessonModule[];
}

export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  payment_status: 'pending' | 'completed' | 'failed';
  is_ready_for_class: boolean;
  enrolled_at: string;
  payment_method?: 'mpesa' | 'visa';
  transaction_ref?: string;
  course?: Course;
}

export interface AudioSubmission {
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

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  user_email: string;
  role: string;
  endpoint: string;
  action: string;
  status: '200_OK' | '403_FORBIDDEN' | '401_UNAUTHORIZED';
  details: string;
}

export type SupportedLocale = 'en' | 'sw' | 'fr' | 'de' | 'zh';
