-- ============================================================================
-- LughaSmart Language Academy — PostgreSQL Database Schema (schema.sql)
-- Supports:
--   * Kenyan Local Languages (Kiswahili, Gĩkũyũ, Dholuo, Maa) &
--     Foreign Languages (Chinese, German, French)
--   * Adult Classes (3-Hour Live Jitsi Sessions) &
--     Children Sessions (1-Hour Interactive Word Games & Visual Image Sharing)
--   * Per-Session Enrollment vs. Discounted Whole-Month Unlimited Pass
--   * M-Pesa (Kenya) & Visa (International) Payment Verification
--   * Tutor-Shared Images, Catch-Up Audio Recordings & Uploaded PDFs
--   * Tutor Tests, Student Progress / Module Coverage & Satisfaction Ratings
--   * Strict Role-Based Access Control (student vs. tutor) & Security Audit Log
-- ============================================================================

BEGIN;

-- 1. USERS & ROLE-BASED ACCESS CONTROL (TUTOR IS ALSO SYSTEM ADMIN)
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    uid             VARCHAR(128) UNIQUE NOT NULL,
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(200) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'student'
                    CHECK (role IN ('student', 'tutor')),
    is_admin        BOOLEAN NOT NULL DEFAULT FALSE,
    admin_pin_hash  TEXT,
    country_code    VARCHAR(10) DEFAULT 'KE',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_student_never_admin CHECK (role = 'tutor' OR is_admin = FALSE)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. COURSES (KENYAN & FOREIGN, ADULT 3-HR & CHILDREN 1-HR)
CREATE TABLE IF NOT EXISTS courses (
    id                       VARCHAR(64) PRIMARY KEY,
    title                    VARCHAR(200) NOT NULL,
    language_name            VARCHAR(100) NOT NULL,
    category                 VARCHAR(20) NOT NULL CHECK (category IN ('kenyan', 'foreign')),
    audience                 VARCHAR(20) NOT NULL CHECK (audience IN ('adult', 'children')),
    session_duration_minutes INTEGER NOT NULL CHECK (session_duration_minutes IN (60, 180)),
    description              TEXT NOT NULL,
    level                    VARCHAR(80) NOT NULL,
    per_session_price_kes    NUMERIC(10, 2) NOT NULL CHECK (per_session_price_kes >= 0),
    monthly_pass_price_kes   NUMERIC(10, 2) NOT NULL CHECK (monthly_pass_price_kes >= 0),
    jitsi_room_name          VARCHAR(150) NOT NULL,
    pdf_title                VARCHAR(200) NOT NULL,
    tutor_id                 INTEGER REFERENCES users(id) ON DELETE SET NULL,
    tutor_name               VARCHAR(150) NOT NULL,
    image_url                TEXT,
    lessons_count            INTEGER NOT NULL DEFAULT 10,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_audience ON courses(audience);

-- 3. COURSE MODULES (FOR MONITORING MODULES COVERED BY EACH STUDENT)
CREATE TABLE IF NOT EXISTS course_modules (
    id              VARCHAR(64) PRIMARY KEY,
    course_id       VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    module_order    INTEGER NOT NULL,
    title           VARCHAR(200) NOT NULL,
    summary         TEXT NOT NULL
);

-- 4. ENROLLMENTS & PAYMENTS (PER-SESSION OR DISCOUNTED MONTHLY UNLIMITED PASS)
CREATE TABLE IF NOT EXISTS enrollments (
    id                      VARCHAR(128) PRIMARY KEY,
    student_id              INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id               VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    plan_type               VARCHAR(20) NOT NULL CHECK (plan_type IN ('per_session', 'monthly_pass')),
    amount_kes              NUMERIC(10, 2) NOT NULL CHECK (amount_kes >= 0),
    payment_method          VARCHAR(20) NOT NULL CHECK (payment_method IN ('mpesa', 'visa')),
    transaction_ref         VARCHAR(100) UNIQUE NOT NULL,
    payment_status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                            CHECK (payment_status IN ('pending', 'completed', 'revoked')),
    jitsi_room_url          TEXT NOT NULL,
    preferred_slot          VARCHAR(150),
    is_ready_for_class      BOOLEAN NOT NULL DEFAULT FALSE,
    modules_completed_count INTEGER NOT NULL DEFAULT 0,
    total_modules           INTEGER NOT NULL DEFAULT 4,
    test_score_avg          NUMERIC(5, 2) NOT NULL DEFAULT 0,
    enrolled_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at              TIMESTAMPTZ,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(payment_status);

-- 5. STUDENT MODULE PROGRESS TRACKING (MONITORED BY TUTOR)
CREATE TABLE IF NOT EXISTS student_module_progress (
    id              SERIAL PRIMARY KEY,
    enrollment_id   VARCHAR(128) NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    module_id       VARCHAR(64) NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    completed       BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at    TIMESTAMPTZ,
    UNIQUE(enrollment_id, module_id)
);

-- 6. TUTOR-SHARED MATERIALS (PDFS, CATCH-UP AUDIO RECORDINGS & EXPLANATORY IMAGES)
CREATE TABLE IF NOT EXISTS shared_materials (
    id              VARCHAR(128) PRIMARY KEY,
    course_id       VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    material_type   VARCHAR(20) NOT NULL CHECK (material_type IN ('pdf', 'audio', 'image')),
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    file_name       VARCHAR(255) NOT NULL,
    media_url       TEXT NOT NULL,
    duration_label  VARCHAR(50),
    uploaded_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_materials_course ON shared_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_materials_type ON shared_materials(material_type);

-- 7. TESTS & STUDENT PROGRESS ASSESSMENTS
CREATE TABLE IF NOT EXISTS tests (
    id              VARCHAR(128) PRIMARY KEY,
    course_id       VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    audience        VARCHAR(20) NOT NULL CHECK (audience IN ('adult', 'children')),
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    created_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_questions (
    id              SERIAL PRIMARY KEY,
    test_id         VARCHAR(128) NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    prompt          TEXT NOT NULL,
    options_json    JSONB NOT NULL,
    correct_index   INTEGER NOT NULL CHECK (correct_index >= 0)
);

CREATE TABLE IF NOT EXISTS test_submissions (
    id              VARCHAR(128) PRIMARY KEY,
    test_id         VARCHAR(128) NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    course_id       VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score_percent   NUMERIC(5, 2) NOT NULL CHECK (score_percent >= 0 AND score_percent <= 100),
    correct_count   INTEGER NOT NULL,
    total_count     INTEGER NOT NULL CHECK (total_count > 0),
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PRONUNCIATION AUDIO SUBMISSIONS & TUTOR CRITIQUE
CREATE TABLE IF NOT EXISTS audio_submissions (
    id              VARCHAR(128) PRIMARY KEY,
    student_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id       VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    language        VARCHAR(100) NOT NULL,
    phrase          TEXT NOT NULL,
    audio_url       TEXT,
    accuracy_score  INTEGER NOT NULL CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
    tutor_feedback  TEXT DEFAULT '',
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. CHILDREN'S INTERACTIVE 1-HOUR WORD GAME SCORES
CREATE TABLE IF NOT EXISTS word_game_scores (
    id              VARCHAR(128) PRIMARY KEY,
    student_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language_name   VARCHAR(100) NOT NULL,
    score           INTEGER NOT NULL CHECK (score >= 0),
    pairs_matched   INTEGER NOT NULL CHECK (pairs_matched >= 0),
    played_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. TUTOR RATINGS & STUDENT SATISFACTION FEEDBACK
CREATE TABLE IF NOT EXISTS tutor_ratings (
    id                  VARCHAR(128) PRIMARY KEY,
    student_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id           VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    tutor_name          VARCHAR(150) NOT NULL,
    rating              INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    satisfaction_level  VARCHAR(40) NOT NULL
                        CHECK (satisfaction_level IN ('Very Satisfied', 'Satisfied', 'Neutral', 'Needs Improvement')),
    comment             TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. DAILY LIVE SESSIONS (UPDATED DAILY BY TUTOR)
CREATE TABLE IF NOT EXISTS live_sessions (
    id              VARCHAR(128) PRIMARY KEY,
    course_id       VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    session_date    DATE NOT NULL,
    start_time_eat  VARCHAR(20) NOT NULL,
    end_time_eat    VARCHAR(20) NOT NULL,
    topic           VARCHAR(200) NOT NULL,
    jitsi_room_url  TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled', 'live_now', 'completed')),
    updated_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_sessions_date ON live_sessions(session_date);

-- 12. EMAIL CLASS-TIME UPDATES SENT BY TUTOR TO ENROLLED STUDENTS
CREATE TABLE IF NOT EXISTS class_email_notifications (
    id              VARCHAR(128) PRIMARY KEY,
    course_id       VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    recipient_email VARCHAR(200) NOT NULL,
    recipient_name  VARCHAR(150) NOT NULL,
    subject         VARCHAR(200) NOT NULL,
    message_body    TEXT NOT NULL,
    class_time_info VARCHAR(150) NOT NULL,
    sent_by         INTEGER REFERENCES users(id) ON DELETE SET NULL,
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON class_email_notifications(recipient_email);

-- 13. SECURITY & RBAC AUDIT LOGS
CREATE TABLE IF NOT EXISTS security_audit_logs (
    id              SERIAL PRIMARY KEY,
    user_email      VARCHAR(200) NOT NULL,
    role            VARCHAR(20) NOT NULL,
    endpoint        VARCHAR(200) NOT NULL,
    action          VARCHAR(100) NOT NULL,
    http_status     INTEGER NOT NULL,
    details         TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. DAILY TRANSACTION REPORT VIEW FOR TUTOR ACCOUNTING
CREATE OR REPLACE VIEW daily_transaction_summary AS
SELECT
    DATE(enrolled_at AT TIME ZONE 'Africa/Nairobi') AS transaction_date,
    COUNT(*) AS total_transactions,
    COUNT(*) FILTER (WHERE payment_method = 'mpesa') AS mpesa_count,
    COUNT(*) FILTER (WHERE payment_method = 'visa') AS visa_count,
    COUNT(*) FILTER (WHERE plan_type = 'monthly_pass') AS monthly_pass_count,
    COUNT(*) FILTER (WHERE plan_type = 'per_session') AS per_session_count,
    COALESCE(SUM(amount_kes) FILTER (WHERE payment_status = 'completed'), 0) AS total_revenue_kes
FROM enrollments
GROUP BY DATE(enrolled_at AT TIME ZONE 'Africa/Nairobi')
ORDER BY transaction_date DESC;

-- ============================================================================
-- SEED SAMPLE TUTOR, STUDENT & COURSES (IDEMPOTENT)
-- ============================================================================
INSERT INTO users (uid, full_name, email, password_hash, role, is_admin, admin_pin_hash, country_code)
VALUES
    ('tutor-amina-01', 'Dr. Amina Wambui', 'amina.wambui@lughasmart.ac.ke', 'scrypt$replace_with_real_hash', 'tutor', TRUE, 'scrypt$replace_with_pin_hash', 'KE'),
    ('demo-student-1', 'John Miller', 'john.miller@example.com', 'scrypt$replace_with_real_hash', 'student', FALSE, NULL, 'US')
ON CONFLICT (email) DO NOTHING;

INSERT INTO courses (
    id, title, language_name, category, audience, session_duration_minutes,
    description, level, per_session_price_kes, monthly_pass_price_kes,
    jitsi_room_name, pdf_title, tutor_name, lessons_count
) VALUES
    (
        'swahili-adult-101',
        'Conversational Kiswahili for Professionals & Expats',
        'Kiswahili (Swahili)',
        'kenyan',
        'adult',
        180,
        'Three-hour live immersion covering everyday East African conversation, Nairobi workplace communication, and coastal etiquette.',
        'Beginner to Intermediate',
        1500.00,
        9600.00,
        'LughaSmart-Kiswahili-Adult-3Hr',
        'Kiswahili_Adult_Immersion_Workbook.pdf',
        'Dr. Amina Wambui',
        12
    ),
    (
        'swahili-kids-102',
        'Kiswahili Play & Word Discovery (Children)',
        'Kiswahili (Swahili)',
        'kenyan',
        'children',
        60,
        'One-hour interactive session with word-matching games, illustrated animal & market picture cards, and cheerful pronunciation songs.',
        'Ages 6-13',
        900.00,
        5800.00,
        'LughaSmart-Kiswahili-Kids-1Hr',
        'Kiswahili_Kids_Picture_Storybook.pdf',
        'Dr. Amina Wambui',
        10
    ),
    (
        'chinese-adult-401',
        'Mandarin Chinese for Trade, Diplomacy & Travel',
        'Chinese (Mandarin)',
        'foreign',
        'adult',
        180,
        'Three-hour live Mandarin sessions mastering the four tones, Pinyin, business introductions, and practical travel dialogues.',
        'HSK 1-2 Foundation',
        1800.00,
        11200.00,
        'LughaSmart-Mandarin-Adult-3Hr',
        'Mandarin_Pinyin_And_Business_Guide.pdf',
        'Prof. Lin Wei & Dr. Amina',
        14
    ),
    (
        'german-adult-501',
        'German (Deutsch) Everyday & Relocation Track',
        'German (Deutsch)',
        'foreign',
        'adult',
        180,
        'Three-hour structured German sessions focused on pronunciation, A1/A2 grammar clarity, workplace communication, and daily life.',
        'A1-A2',
        1800.00,
        11200.00,
        'LughaSmart-German-Adult-3Hr',
        'Deutsch_A1_Practical_Grammar_Workbook.pdf',
        'Lukas Weber',
        12
    ),
    (
        'french-kids-601',
        'French (Français) Interactive Word & Picture Club (Children)',
        'French (Français)',
        'foreign',
        'children',
        60,
        'Lively one-hour children session combining visual flashcards, interactive word-matching games, and gentle pronunciation drills.',
        'Ages 6-13',
        1000.00,
        6400.00,
        'LughaSmart-French-Kids-1Hr',
        'Francais_Jeunes_Word_Games_Pack.pdf',
        'Claire Moreau',
        10
    )
ON CONFLICT (id) DO NOTHING;

COMMIT;
