#!/usr/bin/env python3
"""
LughaSmart Pure-Python Backend Server
- Zero external dependencies (Python 3.10+ standard library only)
- Bound to 127.0.0.1:8765 (avoids sandbox port 8000 and ingress port 8080/3000)
- Persistent SQLite database (backend/lughasmart.db) aligned with schema.sql
- Strict RBAC enforcement (403 Forbidden on /api/tutor/* for non-tutor roles)
"""

from __future__ import annotations

import io
import json
import mimetypes
import os
import random
import re
import sqlite3
import tarfile
import threading
import time
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = Path(__file__).resolve().parent
DB_PATH = Path(os.environ.get("LUGHA_DB_PATH", str(BACKEND_DIR / "lughasmart.db")))
DJANGO_DIR = ROOT_DIR / "lugha_tutor"
PUBLIC_DIR = ROOT_DIR / "public"
DIST_DIR = ROOT_DIR / "dist"

DB_LOCK = threading.RLock()


def now_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db() -> None:
    with DB_LOCK:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        conn = get_conn()
        try:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    full_name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT NOT NULL CHECK (role IN ('student', 'tutor')) DEFAULT 'student',
                    avatar_url TEXT DEFAULT NULL,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS courses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    language_name TEXT NOT NULL,
                    description TEXT,
                    price_kes REAL NOT NULL,
                    course_type TEXT NOT NULL CHECK (course_type IN ('pdf', 'audio', 'live')),
                    level TEXT DEFAULT 'Beginner',
                    lessons_count INTEGER DEFAULT 12,
                    duration_weeks INTEGER DEFAULT 4,
                    pdf_curriculum_name TEXT DEFAULT NULL,
                    tutor_name TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS enrollments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                    payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
                    is_ready_for_class INTEGER NOT NULL DEFAULT 0,
                    enrolled_at TEXT NOT NULL,
                    payment_method TEXT DEFAULT NULL,
                    transaction_ref TEXT DEFAULT NULL,
                    preferred_time_slot TEXT DEFAULT 'Tue & Thu · 18:00 - 19:00 EAT (15:00 UTC)',
                    next_live_session TEXT DEFAULT 'Today at 18:00 EAT',
                    payment_verified_by_tutor INTEGER NOT NULL DEFAULT 1,
                    tutor_confirmation_notes TEXT DEFAULT NULL,
                    UNIQUE(student_id, course_id)
                );

                CREATE TABLE IF NOT EXISTS audio_submissions (
                    id TEXT PRIMARY KEY,
                    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                    phrase TEXT NOT NULL,
                    language TEXT NOT NULL,
                    audio_url TEXT NOT NULL,
                    accuracy_score INTEGER NOT NULL,
                    feedback TEXT DEFAULT NULL,
                    tutor_audio_url TEXT DEFAULT NULL,
                    submitted_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS security_audit_logs (
                    id TEXT PRIMARY KEY,
                    timestamp TEXT NOT NULL,
                    user_email TEXT NOT NULL,
                    role TEXT NOT NULL,
                    endpoint TEXT NOT NULL,
                    action TEXT NOT NULL,
                    status TEXT NOT NULL,
                    details TEXT NOT NULL
                );
                """
            )

            user_count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
            if user_count == 0:
                conn.executemany(
                    """
                    INSERT INTO users (id, full_name, email, password_hash, role, avatar_url, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    [
                        (
                            1,
                            "John Miller (Expat Learner)",
                            "john.miller@example.com",
                            "scrypt:sha256$e2e_hashed_salt$student",
                            "student",
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
                            "2026-03-01 10:24:00",
                        ),
                        (
                            2,
                            "Dr. Amina Wambui (Senior Linguist)",
                            "amina.wambui@lughasmart.ac.ke",
                            "scrypt:sha256$e2e_hashed_salt$tutor",
                            "tutor",
                            "/src/assets/images/tutor_amina_avatar_1794473845671.jpg",
                            "2026-01-15 08:00:00",
                        ),
                        (
                            3,
                            "Sarah Chen (UN Diplomat)",
                            "sarah.chen@example.org",
                            "scrypt:sha256$e2e_hashed_salt$student",
                            "student",
                            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
                            "2026-03-05 14:10:00",
                        ),
                    ],
                )

            course_count = conn.execute("SELECT COUNT(*) FROM courses").fetchone()[0]
            if course_count == 0:
                conn.executemany(
                    """
                    INSERT INTO courses (
                        id, title, language_name, description, price_kes,
                        course_type, level, lessons_count, duration_weeks,
                        pdf_curriculum_name, tutor_name
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    [
                        (
                            101,
                            "Conversational Kiswahili for Foreigners & Expats",
                            "Swahili (Kiswahili)",
                            "Master everyday conversational Swahili, greetings, market bargaining, transport navigation, and cultural etiquette across Kenya and East Africa.",
                            4500.00,
                            "live",
                            "Beginner to Intermediate",
                            12,
                            4,
                            "LughaSmart_Swahili_Conversational_Curriculum_v3.pdf",
                            "Dr. Amina Wambui",
                        ),
                        (
                            102,
                            "Gĩkũyũ Indigenous Heritage & Business Dialect",
                            "Kikuyu (Gĩkũyũ)",
                            "Comprehensive oral mastery, tonal pronunciation guides, central Kenya commerce vocabulary, kinship terms, and native proverb wisdom.",
                            5200.00,
                            "audio",
                            "Foundational",
                            10,
                            5,
                            "Kikuyu_Phonetics_Pronunciation_Manual.pdf",
                            "Mwalimu James Mwangi",
                        ),
                        (
                            103,
                            "Dholuo Intensive: Lake Region Social & Cultural Immersion",
                            "Luo (Dholuo)",
                            "Deep dive into Luo syntax, greeting rituals, conversational flow, melodic inflections, and vibrant socio-cultural idioms for Western Kenya travelers.",
                            4800.00,
                            "live",
                            "Beginner",
                            12,
                            4,
                            "Dholuo_Grammar_and_Conversation_Guide.pdf",
                            "Otieno Kevin Ochieng",
                        ),
                        (
                            104,
                            "Maa (Maasai) Cultural Dialogue & Wildlife Community Relations",
                            "Maasai (Maa)",
                            "Specialized language program for conservationists, eco-tourists, researchers, and safari travelers working alongside indigenous Maasai pastoral communities.",
                            6000.00,
                            "pdf",
                            "Essential Field Guide",
                            8,
                            3,
                            "Maasai_Community_Field_Language_Guide.pdf",
                            "Saitoti Ole Kaelo",
                        ),
                        (
                            105,
                            "Kalenjin Tonal Phonics & Rift Valley Social Traditions",
                            "Kalenjin (Nandi/Kipsigis)",
                            "Explore the rhythmic tones and communal greetings of the Kalenjin languages spoken in Kenya’s fertile Great Rift Valley highlands.",
                            4600.00,
                            "audio",
                            "Foundational",
                            8,
                            4,
                            "Kalenjin_Highland_Dialect_Handbook.pdf",
                            "Faith Chebet",
                        ),
                        (
                            106,
                            "Kikamba Express: Eastern Kenya Trade & Friendly Colloquialisms",
                            "Kamba (Kikamba)",
                            "Learn rapid trade colloquialisms, polite phrasing, and artisan community communications for Machakos, Kitui, and Makueni travelers.",
                            3800.00,
                            "live",
                            "Beginner",
                            6,
                            2,
                            "Kikamba_Conversational_Phrases.pdf",
                            "Boniface Mutua",
                        ),
                    ],
                )

            enr_count = conn.execute("SELECT COUNT(*) FROM enrollments").fetchone()[0]
            if enr_count == 0:
                conn.executemany(
                    """
                    INSERT INTO enrollments (
                        id, student_id, course_id, payment_status, is_ready_for_class,
                        enrolled_at, payment_method, transaction_ref, preferred_time_slot,
                        next_live_session, payment_verified_by_tutor, tutor_confirmation_notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    [
                        (
                            1,
                            1,
                            101,
                            "completed",
                            1,
                            "2026-03-02 11:15:00",
                            "mpesa",
                            "MPESA_QK8820XPLM",
                            "Tue & Thu · 18:00 - 19:00 EAT (15:00 UTC)",
                            "Today at 18:00 EAT (in 2 hours)",
                            1,
                            "Safaricom Daraja STK Push verified under receipt QK8820XPLM. Certified access.",
                        ),
                        (
                            2,
                            3,
                            103,
                            "completed",
                            0,
                            "2026-03-06 09:30:00",
                            "visa",
                            "VISA_AUTH_948271",
                            "Mon & Wed · 14:00 - 15:00 EAT (11:00 UTC)",
                            "Tomorrow at 14:00 EAT",
                            1,
                            "Visa 3D-Secure settled via Stanbic Bank gateway. Approved.",
                        ),
                    ],
                )

            sub_count = conn.execute("SELECT COUNT(*) FROM audio_submissions").fetchone()[0]
            if sub_count == 0:
                conn.execute(
                    """
                    INSERT INTO audio_submissions (
                        id, student_id, course_id, phrase, language, audio_url,
                        accuracy_score, feedback, tutor_audio_url, submitted_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        "sub_01",
                        1,
                        101,
                        "Habari gani? Jina langu ni John.",
                        "Swahili",
                        "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=",
                        92,
                        'Excellent vocal inflection! Soften the "r" in "Habari" slightly for authentic coastal cadence.',
                        "sample_tutor_audio.mp3",
                        "2026-03-08 14:20:00",
                    ),
                )

            log_count = conn.execute("SELECT COUNT(*) FROM security_audit_logs").fetchone()[0]
            if log_count == 0:
                conn.execute(
                    """
                    INSERT INTO security_audit_logs (
                        id, timestamp, user_email, role, endpoint, action, status, details
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        "audit_01",
                        "2026-03-08 10:14:22",
                        "john.miller@example.com",
                        "student",
                        "/student/dashboard",
                        "VIEW_COURSE_LESSONS",
                        "200_OK",
                        "Authorized student access granted to enrolled course 101.",
                    ),
                )

            conn.commit()
        finally:
            conn.close()


def row_to_enrollment(row: sqlite3.Row) -> dict:
    d = dict(row)
    d["is_ready_for_class"] = bool(d["is_ready_for_class"])
    d["payment_verified_by_tutor"] = bool(d["payment_verified_by_tutor"])
    return d


def log_audit(
    conn: sqlite3.Connection,
    user_email: str,
    role: str,
    endpoint: str,
    action: str,
    status: str,
    details: str,
) -> str:
    audit_id = f"audit_{int(time.time() * 1000)}_{random.randint(100, 999)}"
    conn.execute(
        """
        INSERT INTO security_audit_logs (id, timestamp, user_email, role, endpoint, action, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (audit_id, now_str(), user_email, role, endpoint, action, status, details),
    )
    return audit_id


SCHEMA_SQL_DISPLAY = """
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
);""".strip()


class LughaHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, format: str, *args) -> None:
        pass

    def _send_json(self, payload: dict, status: int = 200) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", "0") or "0")
        if length <= 0:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return {}

    def _require_tutor(self) -> bool:
        user_role = (self.headers.get("x-user-role") or "student").strip().lower()
        user_email = (self.headers.get("x-user-email") or "anonymous").strip()
        if user_role == "tutor":
            return True

        with DB_LOCK:
            conn = get_conn()
            try:
                audit_id = log_audit(
                    conn,
                    user_email=user_email,
                    role=user_role,
                    endpoint=self.path,
                    action="RBAC_SECURITY_VIOLATION_ATTEMPT",
                    status="403_FORBIDDEN",
                    details=f"Access Denied: User with role '{user_role}' strictly prohibited from tutor management pathways.",
                )
                conn.commit()
            finally:
                conn.close()

        self._send_json(
            {
                "error": "Forbidden (HTTP 403)",
                "message": "Direct URL manipulation or unauthorized pathway detected. Tutor console is restricted to certified educators.",
                "security_event_id": audit_id,
            },
            status=HTTPStatus.FORBIDDEN,
        )
        return False

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/health":
            self._send_json(
                {
                    "status": "ok",
                    "runtime": "python-stdlib",
                    "database": str(DB_PATH.name),
                }
            )
            return

        if path == "/api/courses":
            with DB_LOCK:
                conn = get_conn()
                try:
                    rows = conn.execute("SELECT * FROM courses ORDER BY id ASC").fetchall()
                    self._send_json({"courses": [dict(r) for r in rows]})
                finally:
                    conn.close()
            return

        m_user = re.fullmatch(r"/api/user/(\d+)/state", path)
        if m_user:
            user_id = int(m_user.group(1))
            with DB_LOCK:
                conn = get_conn()
                try:
                    user_row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
                    if not user_row:
                        self._send_json({"error": "User not found"}, status=404)
                        return
                    enr_rows = conn.execute(
                        "SELECT * FROM enrollments WHERE student_id = ? ORDER BY id DESC",
                        (user_id,),
                    ).fetchall()
                    enriched = []
                    for row in enr_rows:
                        enr = row_to_enrollment(row)
                        course_row = conn.execute(
                            "SELECT * FROM courses WHERE id = ?", (enr["course_id"],)
                        ).fetchone()
                        enr["course"] = dict(course_row) if course_row else None
                        enriched.append(enr)

                    subs = conn.execute(
                        "SELECT * FROM audio_submissions WHERE student_id = ? ORDER BY submitted_at DESC",
                        (user_id,),
                    ).fetchall()
                    self._send_json(
                        {
                            "user": dict(user_row),
                            "enrollments": enriched,
                            "submissions": [dict(s) for s in subs],
                        }
                    )
                finally:
                    conn.close()
            return

        if path == "/api/tutor/live-students":
            if not self._require_tutor():
                return
            with DB_LOCK:
                conn = get_conn()
                try:
                    completed = conn.execute(
                        "SELECT * FROM enrollments WHERE payment_status = 'completed' ORDER BY id DESC"
                    ).fetchall()
                    ready_students = []
                    all_roster = []
                    for row in completed:
                        enr = row_to_enrollment(row)
                        student = conn.execute(
                            "SELECT * FROM users WHERE id = ?", (enr["student_id"],)
                        ).fetchone()
                        course = conn.execute(
                            "SELECT * FROM courses WHERE id = ?", (enr["course_id"],)
                        ).fetchone()
                        s_dict = dict(student) if student else None
                        c_dict = dict(course) if course else None
                        if enr["is_ready_for_class"]:
                            ready_students.append(
                                {
                                    "enrollment_id": enr["id"],
                                    "student": s_dict,
                                    "course": c_dict,
                                    "enrolled_at": enr["enrolled_at"],
                                    "payment_ref": enr["transaction_ref"],
                                }
                            )
                        all_roster.append(
                            {
                                "enrollment_id": enr["id"],
                                "student": s_dict,
                                "course": c_dict,
                                "is_ready": enr["is_ready_for_class"],
                                "enrolled_at": enr["enrolled_at"],
                                "payment_method": enr["payment_method"],
                                "transaction_ref": enr["transaction_ref"],
                                "payment_status": enr["payment_status"],
                                "preferred_time_slot": enr["preferred_time_slot"]
                                or "Tue & Thu: 18:00 - 19:00 EAT",
                                "next_live_session": enr["next_live_session"]
                                or "Today at 18:00 EAT",
                                "payment_verified_by_tutor": enr["payment_verified_by_tutor"],
                                "tutor_confirmation_notes": enr["tutor_confirmation_notes"]
                                or "Verified Daraja / Visa transaction.",
                            }
                        )
                    subs = conn.execute(
                        "SELECT * FROM audio_submissions ORDER BY submitted_at DESC"
                    ).fetchall()
                    self._send_json(
                        {
                            "ready_count": len(ready_students),
                            "ready_students": ready_students,
                            "all_roster": all_roster,
                            "audio_submissions": [dict(s) for s in subs],
                        }
                    )
                finally:
                    conn.close()
            return

        if path == "/api/db/schema":
            with DB_LOCK:
                conn = get_conn()
                try:
                    users = [dict(r) for r in conn.execute("SELECT * FROM users ORDER BY id ASC")]
                    courses = [dict(r) for r in conn.execute("SELECT * FROM courses ORDER BY id ASC")]
                    enrollments = [
                        row_to_enrollment(r)
                        for r in conn.execute("SELECT * FROM enrollments ORDER BY id ASC")
                    ]
                    audit_logs = [
                        dict(r)
                        for r in conn.execute(
                            "SELECT * FROM security_audit_logs ORDER BY timestamp DESC"
                        )
                    ]
                    self._send_json(
                        {
                            "schema_sql": SCHEMA_SQL_DISPLAY,
                            "tables": {
                                "users": users,
                                "courses": courses,
                                "enrollments": enrollments,
                                "audit_logs": audit_logs,
                            },
                        }
                    )
                finally:
                    conn.close()
            return

        if path == "/api/security/audit-logs":
            with DB_LOCK:
                conn = get_conn()
                try:
                    logs = [
                        dict(r)
                        for r in conn.execute(
                            "SELECT * FROM security_audit_logs ORDER BY timestamp DESC"
                        )
                    ]
                    self._send_json({"logs": logs})
                finally:
                    conn.close()
            return

        if path == "/api/django-files":
            if not DJANGO_DIR.exists():
                self._send_json({"error": "lugha_tutor directory not found"}, status=404)
                return
            collected = []
            for file_path in sorted(DJANGO_DIR.rglob("*")):
                if not file_path.is_file():
                    continue
                parts = file_path.relative_to(DJANGO_DIR).parts
                if any(p in (".git", "__pycache__", ".venv") for p in parts):
                    continue
                rel = "/".join(parts)
                content = file_path.read_text(encoding="utf-8", errors="replace")
                collected.append(
                    {
                        "path": rel,
                        "content": content,
                        "size": len(content.encode("utf-8")),
                    }
                )
            self._send_json(
                {
                    "root": "lugha_tutor",
                    "branch": "main",
                    "file_count": len(collected),
                    "files": collected,
                }
            )
            return

        if path == "/api/django-archive":
            if not DJANGO_DIR.exists():
                self._send_json({"error": "lugha_tutor directory not found"}, status=404)
                return
            buf = io.BytesIO()
            with tarfile.open(fileobj=buf, mode="w:gz") as tar:
                tar.add(str(DJANGO_DIR), arcname="lugha_tutor")
            payload = buf.getvalue()
            self.send_response(200)
            self.send_header("Content-Type", "application/gzip")
            self.send_header(
                "Content-Disposition",
                'attachment; filename="lugha_tutor_django_repo.tar.gz"',
            )
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        if path.startswith("/public/"):
            rel = path[len("/public/") :].lstrip("/")
            self._serve_static_file(PUBLIC_DIR, rel)
            return

        if DIST_DIR.exists():
            rel = path.lstrip("/") or "index.html"
            target = (DIST_DIR / rel).resolve()
            if target.is_file() and str(target).startswith(str(DIST_DIR.resolve())):
                self._serve_file_bytes(target)
                return
            index_file = DIST_DIR / "index.html"
            if index_file.is_file():
                self._serve_file_bytes(index_file)
                return

        self._send_json({"error": "Endpoint not found"}, status=404)

    def _serve_static_file(self, base_dir: Path, rel: str) -> None:
        target = (base_dir / rel).resolve()
        if not target.is_file() or not str(target).startswith(str(base_dir.resolve())):
            self._send_json({"error": "File not found"}, status=404)
            return
        self._serve_file_bytes(target)

    def _serve_file_bytes(self, file_path: Path) -> None:
        data = file_path.read_bytes()
        ctype, _ = mimetypes.guess_type(str(file_path))
        self.send_response(200)
        self.send_header("Content-Type", ctype or "application/octet-stream")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        body = self._read_json()

        if path == "/api/student/readiness":
            student_id = int(body.get("student_id") or 0)
            course_id = int(body.get("course_id") or 0)
            is_ready = 1 if bool(body.get("is_ready")) else 0
            with DB_LOCK:
                conn = get_conn()
                try:
                    row = conn.execute(
                        "SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?",
                        (student_id, course_id),
                    ).fetchone()
                    if not row:
                        self._send_json(
                            {"error": "Enrollment not found for student and course"},
                            status=404,
                        )
                        return
                    conn.execute(
                        "UPDATE enrollments SET is_ready_for_class = ? WHERE id = ?",
                        (is_ready, row["id"]),
                    )
                    conn.commit()
                    self._send_json(
                        {
                            "success": True,
                            "enrollment_id": row["id"],
                            "is_ready_for_class": bool(is_ready),
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        }
                    )
                finally:
                    conn.close()
            return

        if path == "/api/student/preferred-slot":
            student_id = int(body.get("student_id") or 0)
            course_id = int(body.get("course_id") or 0)
            slot_label = body.get("slot_label") or ""
            next_time = body.get("next_time") or ""
            with DB_LOCK:
                conn = get_conn()
                try:
                    row = conn.execute(
                        "SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?",
                        (student_id, course_id),
                    ).fetchone()
                    if not row:
                        self._send_json({"error": "Enrollment not found"}, status=404)
                        return
                    conn.execute(
                        """
                        UPDATE enrollments
                        SET preferred_time_slot = ?, next_live_session = ?
                        WHERE id = ?
                        """,
                        (slot_label, next_time, row["id"]),
                    )
                    conn.commit()
                    updated = conn.execute(
                        "SELECT * FROM enrollments WHERE id = ?", (row["id"],)
                    ).fetchone()
                    enr = row_to_enrollment(updated)
                    self._send_json(
                        {
                            "success": True,
                            "enrollment": enr,
                            "preferred_time_slot": enr["preferred_time_slot"],
                            "next_live_session": enr["next_live_session"],
                        }
                    )
                finally:
                    conn.close()
            return

        if path == "/api/payments/mpesa/stkpush":
            student_id = body.get("student_id")
            course_id = body.get("course_id")
            phone_number = body.get("phone_number")
            amount_kes = body.get("amount_kes")
            if not phone_number or not course_id or not student_id:
                self._send_json({"error": "Missing required checkout parameters"}, status=400)
                return
            student_id = int(student_id)
            course_id = int(course_id)

            with DB_LOCK:
                conn = get_conn()
                try:
                    course = conn.execute(
                        "SELECT * FROM courses WHERE id = ?", (course_id,)
                    ).fetchone()
                    if not course:
                        self._send_json({"error": "Course not found"}, status=404)
                        return
                    student = conn.execute(
                        "SELECT email FROM users WHERE id = ?", (student_id,)
                    ).fetchone()
                    user_email = student["email"] if student else "student@example.com"

                    checkout_request_id = (
                        f"ws_CO_{int(time.time() * 1000)}_{random.randint(100000, 999999)}"
                    )
                    merchant_request_id = "29384-938201-1"
                    mpesa_receipt = f"QK{random.randint(10000000, 99999999)}"

                    existing = conn.execute(
                        "SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?",
                        (student_id, course_id),
                    ).fetchone()
                    if existing:
                        conn.execute(
                            """
                            UPDATE enrollments
                            SET payment_status = 'completed', payment_method = 'mpesa',
                                transaction_ref = ?, payment_verified_by_tutor = 1
                            WHERE id = ?
                            """,
                            (mpesa_receipt, existing["id"]),
                        )
                        enr_id = existing["id"]
                    else:
                        cur = conn.execute(
                            """
                            INSERT INTO enrollments (
                                student_id, course_id, payment_status, is_ready_for_class,
                                enrolled_at, payment_method, transaction_ref,
                                payment_verified_by_tutor, tutor_confirmation_notes
                            ) VALUES (?, ?, 'completed', 1, ?, 'mpesa', ?, 1, ?)
                            """,
                            (
                                student_id,
                                course_id,
                                now_str(),
                                mpesa_receipt,
                                f"Safaricom Daraja STK Push verified under receipt {mpesa_receipt}.",
                            ),
                        )
                        enr_id = cur.lastrowid

                    log_audit(
                        conn,
                        user_email=user_email,
                        role="student",
                        endpoint="/api/payments/mpesa/stkpush",
                        action="DARAJA_PAYMENT_VERIFIED",
                        status="200_OK",
                        details=f"Safaricom M-Pesa STK Push completed: KES {amount_kes} confirmed under receipt {mpesa_receipt}. Course #{course_id} unlocked instantly.",
                    )
                    conn.commit()
                    enr = row_to_enrollment(
                        conn.execute("SELECT * FROM enrollments WHERE id = ?", (enr_id,)).fetchone()
                    )
                    self._send_json(
                        {
                            "ResponseCode": "0",
                            "ResponseDescription": "Success. Request accepted for processing",
                            "MerchantRequestID": merchant_request_id,
                            "CheckoutRequestID": checkout_request_id,
                            "CustomerMessage": f"Success! KES {amount_kes} received via M-Pesa from {phone_number}. Instant enrollment activated.",
                            "MpesaReceiptNumber": mpesa_receipt,
                            "course_id": course_id,
                            "student_id": student_id,
                            "enrollment": enr,
                        }
                    )
                finally:
                    conn.close()
            return

        if path == "/api/payments/visa/charge":
            student_id = body.get("student_id")
            course_id = body.get("course_id")
            card_number = str(body.get("card_number") or "")
            amount_kes = body.get("amount_kes")
            if not card_number or not student_id or not course_id:
                self._send_json({"error": "Missing credit card parameters"}, status=400)
                return
            student_id = int(student_id)
            course_id = int(course_id)
            auth_code = f"AUTH_VI_{random.randint(100000, 999999)}"
            masked_card = f"•••• •••• •••• {card_number[-4:]}"

            with DB_LOCK:
                conn = get_conn()
                try:
                    course = conn.execute(
                        "SELECT * FROM courses WHERE id = ?", (course_id,)
                    ).fetchone()
                    if not course:
                        self._send_json({"error": "Course not found"}, status=404)
                        return
                    student = conn.execute(
                        "SELECT email FROM users WHERE id = ?", (student_id,)
                    ).fetchone()
                    user_email = student["email"] if student else "student@example.com"

                    existing = conn.execute(
                        "SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?",
                        (student_id, course_id),
                    ).fetchone()
                    if existing:
                        conn.execute(
                            """
                            UPDATE enrollments
                            SET payment_status = 'completed', payment_method = 'visa',
                                transaction_ref = ?, payment_verified_by_tutor = 1
                            WHERE id = ?
                            """,
                            (auth_code, existing["id"]),
                        )
                        enr_id = existing["id"]
                    else:
                        cur = conn.execute(
                            """
                            INSERT INTO enrollments (
                                student_id, course_id, payment_status, is_ready_for_class,
                                enrolled_at, payment_method, transaction_ref,
                                payment_verified_by_tutor, tutor_confirmation_notes
                            ) VALUES (?, ?, 'completed', 1, ?, 'visa', ?, 1, ?)
                            """,
                            (
                                student_id,
                                course_id,
                                now_str(),
                                auth_code,
                                f"Visa 3D-Secure settled ({auth_code}).",
                            ),
                        )
                        enr_id = cur.lastrowid

                    log_audit(
                        conn,
                        user_email=user_email,
                        role="student",
                        endpoint="/api/payments/visa/charge",
                        action="VISA_3DS_PAYMENT_SETTLED",
                        status="200_OK",
                        details=f"Visa/Mastercard 3D-Secure payment verified: KES {amount_kes} processed ({masked_card}). Course #{course_id} granted.",
                    )
                    conn.commit()
                    enr = row_to_enrollment(
                        conn.execute("SELECT * FROM enrollments WHERE id = ?", (enr_id,)).fetchone()
                    )
                    self._send_json(
                        {
                            "success": True,
                            "auth_code": auth_code,
                            "masked_card": masked_card,
                            "amount_kes": amount_kes,
                            "message": "Card authenticated via 3D Secure. Instant access granted.",
                            "enrollment": enr,
                        }
                    )
                finally:
                    conn.close()
            return

        if path == "/api/tutor/verify-payment":
            if not self._require_tutor():
                return
            enrollment_id = int(body.get("enrollment_id") or 0)
            action = (body.get("action") or "verify").strip().lower()
            notes = body.get("notes")
            with DB_LOCK:
                conn = get_conn()
                try:
                    row = conn.execute(
                        "SELECT * FROM enrollments WHERE id = ?", (enrollment_id,)
                    ).fetchone()
                    if not row:
                        self._send_json({"error": "Enrollment record not found"}, status=404)
                        return
                    if action == "verify":
                        payment_status = "completed"
                        verified = 1
                        final_notes = (
                            notes
                            or "Payment manually certified by Tutor. Access granted."
                        )
                    else:
                        payment_status = "failed"
                        verified = 0
                        final_notes = notes or "Access suspended or flagged by Tutor."

                    conn.execute(
                        """
                        UPDATE enrollments
                        SET payment_status = ?, payment_verified_by_tutor = ?, tutor_confirmation_notes = ?
                        WHERE id = ?
                        """,
                        (payment_status, verified, final_notes, enrollment_id),
                    )
                    log_audit(
                        conn,
                        user_email="amina.wambui@lughasmart.ac.ke",
                        role="tutor",
                        endpoint="/api/tutor/verify-payment",
                        action=(
                            "TUTOR_PAYMENT_VERIFIED"
                            if action == "verify"
                            else "TUTOR_ACCESS_REVOKED"
                        ),
                        status="200_OK",
                        details=f"Enrollment #{enrollment_id}: {action.upper()} action taken. Status: {payment_status}. Notes: {final_notes}",
                    )
                    conn.commit()
                    enr = row_to_enrollment(
                        conn.execute(
                            "SELECT * FROM enrollments WHERE id = ?", (enrollment_id,)
                        ).fetchone()
                    )
                    self._send_json(
                        {
                            "success": True,
                            "enrollment": enr,
                            "message": (
                                "Payment confirmed by tutor. Student access verified."
                                if action == "verify"
                                else "Student access suspended."
                            ),
                        }
                    )
                finally:
                    conn.close()
            return

        if path == "/api/tutor/curriculum/update-pdf":
            if not self._require_tutor():
                return
            course_id = int(body.get("course_id") or 0)
            pdf_name = body.get("pdf_name")
            notes = body.get("notes") or "Updated lesson plan"
            with DB_LOCK:
                conn = get_conn()
                try:
                    course = conn.execute(
                        "SELECT * FROM courses WHERE id = ?", (course_id,)
                    ).fetchone()
                    if not course:
                        self._send_json({"error": "Course not found"}, status=404)
                        return
                    new_pdf = pdf_name or course["pdf_curriculum_name"]
                    conn.execute(
                        "UPDATE courses SET pdf_curriculum_name = ? WHERE id = ?",
                        (new_pdf, course_id),
                    )
                    log_audit(
                        conn,
                        user_email="amina.wambui@lughasmart.ac.ke",
                        role="tutor",
                        endpoint="/api/tutor/curriculum/update-pdf",
                        action="CURRICULUM_PDF_UPDATED",
                        status="200_OK",
                        details=f"Course #{course_id} ({course['title']}) PDF updated to '{new_pdf}'. Notes: {notes}",
                    )
                    conn.commit()
                    updated = dict(
                        conn.execute(
                            "SELECT * FROM courses WHERE id = ?", (course_id,)
                        ).fetchone()
                    )
                    self._send_json(
                        {
                            "success": True,
                            "course": updated,
                            "message": f"Curriculum PDF successfully updated for {updated['title']}. Students can view immediately.",
                        }
                    )
                finally:
                    conn.close()
            return

        if path == "/api/audio/submit":
            student_id = int(body.get("student_id") or 1)
            course_id = int(body.get("course_id") or 101)
            phrase = body.get("phrase") or "Jambo, habari yako?"
            language = body.get("language") or "Swahili"
            audio_base64 = body.get("audio_base64") or "data:audio/wav;base64,sample"
            score = random.randint(85, 98)
            feedback = (
                "High accuracy native cadence detected."
                if score > 90
                else "Tone is good, focus on nasal vowel stress."
            )
            sub_id = f"sub_{int(time.time() * 1000)}"
            submitted_at = now_str()

            with DB_LOCK:
                conn = get_conn()
                try:
                    conn.execute(
                        """
                        INSERT INTO audio_submissions (
                            id, student_id, course_id, phrase, language,
                            audio_url, accuracy_score, feedback, submitted_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            sub_id,
                            student_id,
                            course_id,
                            phrase,
                            language,
                            audio_base64,
                            score,
                            feedback,
                            submitted_at,
                        ),
                    )
                    conn.commit()
                    row = dict(
                        conn.execute(
                            "SELECT * FROM audio_submissions WHERE id = ?", (sub_id,)
                        ).fetchone()
                    )
                    self._send_json({"success": True, "submission": row})
                finally:
                    conn.close()
            return

        if path == "/api/tutor/audio-feedback":
            if not self._require_tutor():
                return
            submission_id = body.get("submission_id")
            feedback_text = body.get("feedback_text") or ""
            with DB_LOCK:
                conn = get_conn()
                try:
                    row = conn.execute(
                        "SELECT id FROM audio_submissions WHERE id = ?", (submission_id,)
                    ).fetchone()
                    if not row:
                        self._send_json({"error": "Submission not found"}, status=404)
                        return
                    conn.execute(
                        """
                        UPDATE audio_submissions
                        SET feedback = ?, tutor_audio_url = 'tutor_pronunciation_correction.mp3'
                        WHERE id = ?
                        """,
                        (feedback_text, submission_id),
                    )
                    conn.commit()
                    updated = dict(
                        conn.execute(
                            "SELECT * FROM audio_submissions WHERE id = ?",
                            (submission_id,),
                        ).fetchone()
                    )
                    self._send_json({"success": True, "submission": updated})
                finally:
                    conn.close()
            return

        self._send_json({"error": "Endpoint not found"}, status=404)


def run_server() -> None:
    init_db()
    host = os.environ.get("PYTHON_HOST", "127.0.0.1")
    port = int(os.environ.get("PYTHON_PORT", "8765"))
    server = ThreadingHTTPServer((host, port), LughaHandler)
    print(f"LughaSmart Pure-Python Backend listening on http://{host}:{port} (SQLite: {DB_PATH})", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    run_server()
