from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from academy.models import Course, Enrollment, Lesson, LiveSession


class Command(BaseCommand):
    help = "Seeds LughaSmart with demo Tutor/Student accounts, 6 Kenyan language courses, lessons, and live sessions."

    def handle(self, *args, **options):
        User = get_user_model()

        tutor, created_tutor = User.objects.get_or_create(
            username="tutor",
            defaults={
                "email": "amina.wambui@lughasmart.ac.ke",
                "first_name": "Amina",
                "last_name": "Wambui",
                "is_staff": True,
                "is_superuser": False,
            },
        )
        if created_tutor:
            tutor.set_password("LughaTutor2026!")
            tutor.save()

        student, created_student = User.objects.get_or_create(
            username="student",
            defaults={
                "email": "john.miller@example.com",
                "first_name": "John",
                "last_name": "Miller",
                "is_staff": False,
                "is_superuser": False,
            },
        )
        if created_student:
            student.set_password("LughaStudent2026!")
            student.save()

        seed_courses = [
            {
                "slug": "conversational-kiswahili",
                "title": "Conversational Kiswahili for Foreigners & Expats",
                "language_name": "Swahili (Kiswahili)",
                "description": "Master everyday conversational Swahili, greetings, market bargaining, transport navigation, and cultural etiquette across Kenya.",
                "price_kes": Decimal("4500.00"),
                "level": "beginner",
            },
            {
                "slug": "gikuyu-heritage-business",
                "title": "Gĩkũyũ Indigenous Heritage & Business Dialect",
                "language_name": "Kikuyu (Gĩkũyũ)",
                "description": "Comprehensive oral mastery, tonal pronunciation guides, central Kenya commerce vocabulary, and native proverbs.",
                "price_kes": Decimal("5200.00"),
                "level": "beginner",
            },
            {
                "slug": "dholuo-lake-immersion",
                "title": "Dholuo Intensive: Lake Region Social Immersion",
                "language_name": "Luo (Dholuo)",
                "description": "Deep dive into Luo syntax, greeting rituals, conversational flow, and socio-cultural idioms for Western Kenya travelers.",
                "price_kes": Decimal("4800.00"),
                "level": "beginner",
            },
            {
                "slug": "maa-cultural-dialogue",
                "title": "Maa (Maasai) Cultural Dialogue & Community Relations",
                "language_name": "Maasai (Maa)",
                "description": "Specialized language program for conservationists, eco-tourists, and researchers working alongside Maasai communities.",
                "price_kes": Decimal("6000.00"),
                "level": "field_guide",
            },
            {
                "slug": "kalenjin-tonal-phonics",
                "title": "Kalenjin Tonal Phonics & Rift Valley Traditions",
                "language_name": "Kalenjin (Nandi/Kipsigis)",
                "description": "Explore the rhythmic tones and communal greetings of the Kalenjin languages spoken across Kenya's Rift Valley.",
                "price_kes": Decimal("4600.00"),
                "level": "beginner",
            },
            {
                "slug": "kikamba-express-trade",
                "title": "Kikamba Express: Eastern Kenya Trade Colloquialisms",
                "language_name": "Kamba (Kikamba)",
                "description": "Learn rapid trade colloquialisms, polite phrasing, and artisan communications for Machakos, Kitui, and Makueni.",
                "price_kes": Decimal("3800.00"),
                "level": "beginner",
            },
        ]

        first_course = None
        for idx, item in enumerate(seed_courses):
            course, _ = Course.objects.get_or_create(
                slug=item["slug"],
                defaults={**item, "tutor": tutor, "is_published": True},
            )
            if idx == 0:
                first_course = course

            Lesson.objects.get_or_create(
                course=course,
                order=1,
                defaults={
                    "title": f"Essential Greetings & Introductions in {course.language_name}",
                    "summary": "Core cultural greetings, polite replies, and pronunciation cadence.",
                    "duration_minutes": 35,
                },
            )
            Lesson.objects.get_or_create(
                course=course,
                order=2,
                defaults={
                    "title": "Market Bargaining, Directions & Daily Phrases",
                    "summary": "Practical dialogue drills for transport, markets, and social rapport.",
                    "duration_minutes": 40,
                },
            )

        if first_course is not None:
            Enrollment.objects.get_or_create(
                student=student,
                course=first_course,
                defaults={
                    "payment_status": Enrollment.STATUS_COMPLETED,
                    "paystack_reference": "DEMO-MPESA-QK8820",
                    "amount_paid_kes": first_course.price_kes,
                    "payment_channel": "mobile_money",
                    "is_ready_for_class": True,
                    "paid_at": timezone.now(),
                },
            )
            LiveSession.objects.get_or_create(
                course=first_course,
                title="Live Kiswahili Pronunciation & Q&A",
                defaults={
                    "platform": "jitsi",
                    "meeting_url": "https://meet.jit.si/LughaSmartKiswahiliLiveRoom",
                    "scheduled_at": timezone.now() + timedelta(hours=2),
                    "is_live_now": True,
                    "notes": "Bring your microphone for live coastal cadence coaching.",
                },
            )

        self.stdout.write(
            self.style.SUCCESS(
                "LughaSmart seeded! Demo Tutor: tutor / LughaTutor2026! | Demo Student: student / LughaStudent2026!"
            )
        )
