# LughaSmart — Structured System Design & Architecture

Production blueprint for the **Kenyan Local & Indigenous Languages Tutoring Platform** (`lugha_tutor/`), built with **Python (Django 5)**, **PostgreSQL**, **HTML/CSS**, and **Paystack (M-Pesa + Visa in KES)**.

---

## 1. Layered System Architecture

```
+-----------------------------------------------------------------------+
|                       1. CLIENT / PRESENTATION TIER                   |
|  - Student Portal (HTML5 Audio Player, Inline PDF Notes, Live Room)   |
|  - Tutor Command Center (Lesson Uploads, Live Now Switch, Roster)     |
|  - Public Course Catalog & Paystack Checkout Redirect                 |
+-----------------------------------+-----------------------------------+
                                    | HTTPS (TLS + CSRF + Session Cookie)
                                    v
+-----------------------------------------------------------------------+
|                     2. EDGE & STATIC ASSET TIER                       |
|  - Reverse Proxy (Nginx / Render / Cloud Load Balancer)               |
|  - WhiteNoise CompressedManifestStaticFilesStorage (/static/*)        |
|  - NOTE: private_media/ is NEVER mounted to public web routes         |
+-----------------------------------+-----------------------------------+
                                    | WSGI (Gunicorn workers)
                                    v
+-----------------------------------------------------------------------+
|                  3. PYTHON / DJANGO APPLICATION TIER                  |
|  - Auth & Role Guard: @tutor_required (is_staff=True, else HTTP 403)  |
|  - Student Registration: locked to is_staff=False, is_superuser=False |
|  - Payment Gate: Paystack Initialize + Callback + HMAC-SHA512 Webhook |
|  - Protected Media Proxy: HTTP Range streaming after DB check         |
|  - Hidden Admin Route: configurable ADMIN_URL_PATH in .env            |
+-------------------+-------------------------------+-------------------+
                    | psycopg3 (CONN_MAX_AGE=60)    | Private File I/O
                    v                               v
+-----------------------------------+   +-------------------------------+
|     4. POSTGRESQL DATA TIER       |   |   5. PRIVATE MEDIA VAULT      |
|  - auth_user (Students & Staff)   |   |  - private_media/             |
|  - academy_course                 |   |    ├── courses/<id>/audio/    |
|  - academy_lesson                 |   |    └── courses/<id>/notes/    |
|  - academy_livesession            |   |  - Base URL = None            |
|  - academy_enrollment (atomic)    |   |  - Streamed via Python only   |
|  - academy_paymenttransaction     |   +-------------------------------+
+-----------------------------------+
```

---

## 2. Database Schema & Entity-Relationship Design (PostgreSQL)

```
auth_user (1) ──────< (N) academy_enrollment (N) >────── (1) academy_course
    │                                                           │
    │ (tutor FK, is_staff=True)                                 ├──< (N) academy_lesson
    └───────────────────────────────────────────────────────────┤
                                                                └──< (N) academy_livesession
auth_user (1) ──────< (N) academy_paymenttransaction (N) >────── (1) academy_course
```

| Table | Key Columns | Constraints & Indexes |
| :--- | :--- | :--- |
| `auth_user` | `id`, `username`, `email`, `password`, `is_staff`, `is_superuser` | Students strictly `is_staff=False`; Tutors `is_staff=True` |
| `academy_course` | `id`, `title`, `slug`, `language_name`, `price_kes`, `level`, `tutor_id`, `is_published` | Unique `slug`; `tutor_id` constrained to `is_staff=True` |
| `academy_lesson` | `id`, `course_id`, `order`, `title`, `audio_file`, `pdf_notes`, `duration_minutes` | `UNIQUE(course_id, order)`; files stored in `PrivateMediaStorage` |
| `academy_livesession` | `id`, `course_id`, `title`, `platform`, `meeting_url`, `scheduled_at`, `is_live_now` | Ordered by `-is_live_now, scheduled_at` |
| `academy_enrollment` | `id`, `student_id`, `course_id`, `payment_status`, `paystack_reference`, `amount_paid_kes`, `is_ready_for_class` | `UNIQUE(student_id, course_id)`; indexed on `(student_id, payment_status)` and `(course_id, payment_status, is_ready_for_class)` |
| `academy_paymenttransaction` | `id`, `reference`, `student_id`, `course_id`, `amount_kes`, `channel`, `status`, `verified_via`, `raw_gateway_payload` | Unique `reference`; row-locked via `select_for_update()` during confirmation |

---

## 3. Role-Based Access Control (RBAC) Matrix

| Route / Capability | Anonymous | Student (`is_staff=False`) | Tutor (`is_staff=True`) |
| :--- | :---: | :---: | :---: |
| Course Catalog (`/`) & Syllabus (`/courses/<slug>/`) | Allow | Allow | Allow |
| Student Sign-Up (`/accounts/register/`) | Allow (creates `is_staff=False`) | Redirect | Redirect |
| Paystack Checkout (`/courses/<slug>/checkout/`) | Login Redirect | Allow | Allow |
| Lesson View & Protected Audio/PDF Stream | Login Redirect | Allow **only if** `Enrollment.payment_status == 'completed'` (else `403`) | Allow |
| Ready-for-Class Toggle (`/courses/<slug>/ready-toggle/`) | Login Redirect | Allow (enrolled) | N/A |
| Tutor Dashboard (`/tutor/dashboard/`) | Login Redirect | **HTTP 403 Forbidden** | Allow |
| One-Click Live Switch (`/tutor/sessions/<id>/toggle-live/`) | Login Redirect | **HTTP 403 Forbidden** | Allow |
| Hidden Admin (`/<ADMIN_URL_PATH>/`) | Login Redirect | **Denied** | Superuser/Staff |

---

## 4. Payment & Enrollment State Machine (Paystack M-Pesa + Visa)

1. **Initialize (`POST /courses/<slug>/checkout/`)**:
   - Creates `PaymentTransaction(status="initialized")` with unique reference `LS-<course>-<student>-<hex>`.
   - Calls Paystack `/transaction/initialize` with `currency="KES"`, `amount = price_kes * 100`, `channels=["card", "mobile_money"]`.
2. **Dual Verification (Callback + Webhook)**:
   - **Browser Callback** (`GET /payments/paystack/callback/`): verifies reference server-side via `/transaction/verify/<reference>`.
   - **Signed Webhook** (`POST /payments/paystack/webhook/`): validates `HTTP_X_PAYSTACK_SIGNATURE` using constant-time `hmac.compare_digest` with HMAC-SHA512 against `PAYSTACK_SECRET_KEY` (returns `401` if invalid).
3. **Atomic Activation (`transaction.atomic()` + `select_for_update()`)**:
   - Locks `PaymentTransaction` and `Enrollment` rows.
   - Verifies `status == "success"`, `currency == "KES"`, and `paid_subunits >= expected_subunits`.
   - Idempotently promotes `Enrollment.payment_status = "completed"`.

---

## 5. Piracy-Protected Media Streaming Pipeline

1. **Upload**: Tutor uploads MP3/WAV audio (`audio_file`) and PDF notes (`pdf_notes`) via `TutorDashboard` -> saved to `private_media/courses/<id>/lessons/...` using `PrivateMediaStorage(base_url=None)`.
2. **Authorization**: `GET /media/protected/<lesson_id>/<asset_type>/` verifies `request.user.is_authenticated` and either `request.user.is_staff` or `Enrollment(payment_status="completed").exists()`.
3. **Streaming**:
   - Parses `HTTP_RANGE` (`bytes=start-end`) and returns `206 Partial Content` via `StreamingHttpResponse` so browsers can scrub audio without exposing direct URLs.
   - Sets `Content-Disposition: inline`, `Cache-Control: private, no-store, max-age=0`, and `X-Content-Type-Options: nosniff`.

---

## 6. Module Map

```
lugha_tutor/
├── config/
│   ├── settings.py        # PostgreSQL default (USE_POSTGRES=True), WhiteNoise, private_media, security headers
│   └── urls.py            # Obscured ADMIN_URL_PATH + academy routes
├── academy/
│   ├── models.py          # Course, Lesson, LiveSession, Enrollment, PaymentTransaction
│   ├── decorators.py      # @tutor_required (403 Forbidden guard)
│   ├── storage.py         # PrivateMediaStorage (outside static/media)
│   ├── services.py        # Paystack API + HMAC-SHA512 webhook + atomic enrollment
│   ├── forms.py           # Student-only registration + Lesson/LiveSession forms
│   ├── views.py           # Catalog, Paystack checkout/webhook, Range streaming, Tutor dashboard
│   └── management/commands/seed_lughasmart.py
├── templates/             # Base layout, auth, catalog, course room, protected lesson viewer, tutor portal
├── static/css/style.css   # Responsive design tokens & layout
├── private_media/         # Non-public vault for MP3/WAV & PDF curriculum
└── start.sh               # One-command setup & launch script
```
