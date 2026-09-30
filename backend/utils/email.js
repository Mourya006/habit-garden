import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendWelcomeEmail(to, name) {
  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,

    to,

    subject: "🌱 Welcome to Habit Garden!",

    text: `Hey ${name},

Welcome to Habit Garden! 🌿

Your garden is ready.

Choose your first skill, plant your seed, and start growing one day at a time.

Happy growing!

— Habit Garden`,
  });
}

export async function sendPasswordResetEmail(
  to,
  name,
  resetUrl
) {
  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,

    to,

    subject: "🔐 Reset your Habit Garden password",

    text: `Hey ${name},

We received a request to reset your Habit Garden password.

Use the link below to reset your password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.

— Habit Garden`,
  });
}