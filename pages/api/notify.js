/**
 * Memory Wall Notification Endpoint
 * Called when a visitor submits a memory from an embed page on your website.
 *
 * To enable email notifications, install nodemailer:
 *   npm install nodemailer
 *
 * Then add to your .env.local:
 *   NOTIFY_EMAIL=director@yourfuneralhome.com
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=your@gmail.com
 *   SMTP_PASS=your-app-password
 */

export default async function handler(req, res) {
  // Allow CORS so embed pages on your website can call this endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { obituaryName, submitterName, relationship, memoryText } = req.body || {};

  // Log the memory submission
  console.log(`[Memory Wall] New memory for "${obituaryName}" from ${submitterName} (${relationship})`);

  // ─── EMAIL SENDING (uncomment and configure after install) ───────────────
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: Number(process.env.SMTP_PORT),
  //   auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  // });
  // await transporter.sendMail({
  //   from: process.env.SMTP_USER,
  //   to: process.env.NOTIFY_EMAIL,
  //   subject: `New Memory Posted — ${obituaryName}`,
  //   text: `${submitterName} (${relationship}) posted a memory:\n\n"${memoryText}"\n\nLog in to review it.`,
  // });
  // ─────────────────────────────────────────────────────────────────────────

  return res.status(200).json({ ok: true });
}
