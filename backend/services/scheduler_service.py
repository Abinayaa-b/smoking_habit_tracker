from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session
from database import SessionLocal
from models.db_models import User, SmokingLog, MissedDayTracking, SummaryReport
from services.gemini_service import generate_missed_log_message, generate_weekly_summary
from datetime import date, timedelta
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os

scheduler = AsyncIOScheduler()


def _send_email(to_email: str, subject: str, html_body: str):
    """Send HTML email via SMTP."""
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USERNAME")
    smtp_pass = os.getenv("SMTP_PASSWORD")

    if not smtp_user or not smtp_pass:
        print(f"[Email Skipped] SMTP not configured. Would send to {to_email}: {subject}")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = smtp_user
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, to_email, msg.as_string())
        print(f"[Email Sent] {to_email} — {subject}")
    except Exception as e:
        print(f"[Email Error] {e}")


async def detect_missed_logs():
    """Nightly job: detect users who haven't logged today and send escalating reminders."""
    db: Session = SessionLocal()
    try:
        today = date.today()
        users = db.query(User).filter(User.is_active == True).all()

        for user in users:
            latest_log = db.query(SmokingLog).filter(
                SmokingLog.user_id == user.id
            ).order_by(SmokingLog.date.desc()).first()

            missed = db.query(MissedDayTracking).filter(
                MissedDayTracking.user_id == user.id
            ).first()

            last_date = latest_log.date if latest_log else None
            if last_date is None or last_date < today:
                days_missed = (today - last_date).days if last_date else 1
                if missed:
                    missed.consecutive_missing_days = days_missed
                    missed.last_log_date = last_date

                # Escalating notifications
                if days_missed == 1 and not missed.notified_day1:
                    msg = await generate_missed_log_message(user.full_name, 1, user.lang_pref)
                    print(f"[Notif Day 1] {user.email}: {msg}")
                    missed.notified_day1 = True
                elif days_missed == 2 and not missed.notified_day2:
                    msg = await generate_missed_log_message(user.full_name, 2, user.lang_pref)
                    print(f"[Notif Day 2] {user.email}: {msg}")
                    missed.notified_day2 = True
                elif days_missed >= 3 and not missed.notified_day3:
                    msg = await generate_missed_log_message(user.full_name, 3, user.lang_pref)
                    print(f"[Notif Day 3+] {user.email}: {msg}")
                    missed.notified_day3 = True

                db.commit()
    finally:
        db.close()


async def generate_weekly_reports():
    """Weekly job (Sunday 08:00): build and email weekly summary reports."""
    db: Session = SessionLocal()
    try:
        today = date.today()
        week_start = today - timedelta(days=7)
        users = db.query(User).filter(User.is_active == True).all()

        for user in users:
            logs = db.query(SmokingLog).filter(
                SmokingLog.user_id == user.id,
                SmokingLog.date >= week_start,
                SmokingLog.date <= today
            ).all()

            if not logs:
                continue

            total_cigs = sum(l.cigarettes_smoked for l in logs)
            avg_per_day = total_cigs / max(len(logs), 1)
            total_money = sum(l.money_spent or 0 for l in logs)

            ai_insight = await generate_weekly_summary(
                full_name=user.full_name,
                total_cigarettes=total_cigs,
                avg_per_day=avg_per_day,
                money_spent=total_money,
                avg_damage=50.0,  # Placeholder — integrate prediction in full build
                language=user.lang_pref
            )

            html_body = f"""
            <html><body style="font-family:Arial,sans-serif;background:#1a1a2e;color:#eee;padding:30px;">
            <h2 style="color:#e94560;">🫁 Weekly Health Report</h2>
            <p>Hello <strong>{user.full_name}</strong>,</p>
            <h3>📊 This Week's Stats</h3>
            <ul>
              <li>Total cigarettes smoked: <strong>{total_cigs}</strong></li>
              <li>Average per day: <strong>{avg_per_day:.1f}</strong></li>
              <li>Money spent: <strong>₹{total_money:.2f}</strong></li>
            </ul>
            <h3>💬 Your AI Health Coach Says:</h3>
            <p style="background:#16213e;padding:15px;border-radius:8px;border-left:4px solid #e94560;">{ai_insight}</p>
            <p style="font-size:0.8em;color:#888;">⚠️ Educational estimate only. Not a clinical diagnosis. Consult a doctor for medical advice.</p>
            </body></html>
            """
            _send_email(user.email, "Your Weekly Smoking Health Summary", html_body)

            # Save report to DB
            report = SummaryReport(
                user_id=user.id,
                report_type="Weekly",
                start_date=week_start,
                end_date=today,
                total_cigarettes=total_cigs,
                avg_per_day=avg_per_day,
                total_money_spent=total_money,
                ai_motivational_insight=ai_insight,
                email_sent=True,
                generated_content=html_body
            )
            db.add(report)
            db.commit()
    finally:
        db.close()


def init_scheduler():
    """Register and start all scheduled jobs."""
    scheduler.add_job(detect_missed_logs, "cron", hour=23, minute=59, id="missed_logs_check")
    scheduler.add_job(generate_weekly_reports, "cron", day_of_week="sun", hour=8, id="weekly_reports")
    scheduler.start()
    print("[Scheduler] Jobs registered: missed_logs_check (daily 23:59), weekly_reports (Sunday 08:00)")
