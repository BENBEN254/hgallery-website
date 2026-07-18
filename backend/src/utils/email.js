/**
 * Email Service
 * Send emails using Nodemailer
 */

const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send email
 */
const sendEmail = async ({ to, subject, template, data }) => {
  try {
    const transporter = createTransporter();

    // Templates
    const templates = {
      welcome: {
        html: `
          <h1>Welcome to HGALLERY!</h1>
          <p>Hi ${data.name},</p>
          <p>Thank you for joining HGALLERY. We're excited to have you!</p>
          <p>You can now browse our premium collection of glass, aluminium, and home decor products.</p>
          <a href="${process.env.FRONTEND_URL}" style="background:#8B1E22;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;">Start Shopping</a>
          <p>Best regards,<br>HGALLERY Team</p>
        `,
      },
      "reset-password": {
        html: `
          <h1>Reset Your Password</h1>
          <p>Hi ${data.name},</p>
          <p>You requested to reset your password. Click the button below to reset it.</p>
          <a href="${data.resetUrl}" style="background:#8B1E22;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;">Reset Password</a>
          <p>This link will expire in 30 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>HGALLERY Team</p>
        `,
      },
      order: {
        html: `
          <h1>Order Confirmation</h1>
          <p>Hi ${data.name},</p>
          <p>Thank you for your order <strong>#${data.orderNumber}</strong>.</p>
          <p>Total: KSh ${data.total}</p>
          <p>We'll notify you once your order ships.</p>
          <a href="${process.env.FRONTEND_URL}/orders/${data.orderId}" style="background:#8B1E22;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;">View Order</a>
          <p>Best regards,<br>HGALLERY Team</p>
        `,
      },
    };

    const templateData = templates[template];
    if (!templateData) {
      throw new Error("Email template not found");
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: templateData.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Email error:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = { sendEmail };
