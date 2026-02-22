import { Resend } from 'resend';

let resend: Resend | null = null;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn("RESEND_API_KEY is not set. Email sending will be disabled.");
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!resend) {
    console.log(`[Mock Email] To: ${to}, Subject: ${subject}`);
    return true;
  }

  try {
    const data = await resend.emails.send({
      from: 'Velocity AI <onboarding@resend.dev>', // logic to use verified domain if available, else default test domain
      to,
      subject,
      html,
    });
    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export function getWelcomeEmailHtml(username: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Welcome to Velocity AI, ${username}!</h1>
      <p>We're excited to have you on board.</p>
      <p>With Velocity AI, you can:</p>
      <ul>
        <li>Upload PDF notes and get instant summaries.</li>
        <li>Generate quizzes to test your knowledge.</li>
        <li>Use our AI research assistant to learn more.</li>
      </ul>
      <p>Get started by uploading your first document!</p>
      <br/>
      <p>Best regards,<br/>The Velocity AI Team</p>
    </div>
  `;
}

export function getPasswordResetEmailHtml(username: string, resetLink: string) {
  return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Reset Your Password</h1>
        <p>Hello ${username},</p>
        <p>We received a request to reset your password. Click the link below to proceed:</p>
        <p><a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <br/>
        <p>Best regards,<br/>The Velocity AI Team</p>
      </div>
    `;
}
