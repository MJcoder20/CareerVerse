import smtplib
from email.message import EmailMessage

from app.core.config import settings


def send_verification_email(
    recipient_email: str,
    verification_url: str,
) -> None:
    message = EmailMessage()

    message["Subject"] = "Verify your CareerVerse account"
    message["From"] = (
        f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    )
    message["To"] = recipient_email

    message.set_content(
        f"""Welcome to CareerVerse!

Please verify your email address by opening this link:

{verification_url}

This link expires in {settings.EMAIL_VERIFICATION_EXPIRE_HOURS} hours.

If you did not create this account, you can ignore this email.
"""
    )

    message.add_alternative(
        f"""
        <html>
            <body>
                <h2>Welcome to CareerVerse!</h2>
                <p>Please verify your email address to activate your account.</p>
                <p>
                    <a href="{verification_url}"
                       style="background-color:#2563eb;color:white;
                       padding:12px 20px;text-decoration:none;
                       border-radius:6px;">
                        Verify my email
                    </a>
                </p>
                <p>This link expires in
                {settings.EMAIL_VERIFICATION_EXPIRE_HOURS} hours.</p>
                <p>If you did not create this account, ignore this email.</p>
            </body>
        </html>
        """,
        subtype="html",
    )

    with smtplib.SMTP(
        settings.SMTP_HOST,
        settings.SMTP_PORT,
        timeout=15,
    ) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.ehlo()
        smtp.login(
            settings.SMTP_USERNAME,
            settings.SMTP_PASSWORD,
        )
        smtp.send_message(message)
