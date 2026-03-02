import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function sendTestEmail() {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtpout.secureserver.net",
      port: 465,
      secure: true,
      auth: {
        user: process.env.CTIS_EMAIL_USER,       // info@ctistech.com
        pass: process.env.CTIS_EMAIL_PASSWORD,   // your email password
      },
    });

    const info = await transporter.sendMail({
      from: `CentralCore Test <${process.env.CTIS_EMAIL_USER}>`,
      to: process.env.CTIS_EMAIL_USER, // send to yourself for testing
      subject: "SMTP Test — CentralCore",
      html: `
        <h2>SMTP Test Successful</h2>
        <p>This is a test email sent using GoDaddy SMTP.</p>
        <p>If you received this email, your SMTP setup is working correctly.</p>
      `,
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("SMTP ERROR:", error);
  }
}

sendTestEmail();
