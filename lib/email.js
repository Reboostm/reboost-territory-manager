const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'reports@reboostmarketing.com';
const CALENDAR_LINK = process.env.CALENDAR_LINK || '#';

export async function sendAuditReport({ to, businessName, contactName, score, grade, reportUrl }) {
  if (!RESEND_API_KEY) {
    console.log('[Email] Resend key not set — skipping email');
    return null;
  }

  const scoreColor = score >= 70 ? '#10B981' : score >= 45 ? '#F59E0B' : '#EF4444';
  const gradeLabel = { A: 'Excellent', B: 'Good', C: 'Needs Work', D: 'Poor', F: 'Critical' }[grade] || 'Unknown';

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f1f5f9">
  <div style="max-width:600px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1)">

    <div style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:48px 40px;text-align:center">
      <p style="color:#93c5fd;margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:2px">Free Local SEO Report</p>
      <h1 style="color:white;margin:0;font-size:26px;font-weight:700">${businessName}</h1>
    </div>

    <div style="padding:40px">
      <p style="color:#334155;font-size:16px">Hi ${contactName},</p>
      <p style="color:#64748b;line-height:1.6">Your free Local SEO Audit is ready. Here's how <strong>${businessName}</strong> stacks up against competitors in your area:</p>

      <div style="text-align:center;margin:36px 0">
        <div style="display:inline-block;width:130px;height:130px;border-radius:50%;background:${scoreColor};line-height:130px;font-size:44px;font-weight:800;color:white">${score}</div>
        <p style="margin:12px 0 4px;font-size:22px;font-weight:700;color:${scoreColor}">Grade: ${grade}</p>
        <p style="margin:0;color:#64748b;font-size:15px">${gradeLabel}</p>
      </div>

      <div style="text-align:center;margin:32px 0">
        <a href="${reportUrl}" style="display:inline-block;background:#2563eb;color:white;padding:16px 36px;border-radius:10px;text-decoration:none;font-size:16px;font-weight:700">
          View Your Full Report →
        </a>
      </div>

      <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:4px;margin:24px 0">
        <p style="margin:0;color:#92400e;font-size:14px"><strong>Important:</strong> Your report includes a prioritized action plan. Businesses that act on these insights within 30 days see an average 40% improvement in local visibility.</p>
      </div>

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0">

      <p style="color:#64748b;font-size:15px;line-height:1.6">Want us to implement these fixes for you? Our team specializes in local SEO and can have your business ranking higher within 60-90 days.</p>
      <p style="text-align:center;margin:20px 0">
        <a href="${CALENDAR_LINK}" style="color:#2563eb;font-weight:700;font-size:15px">Book a Free 30-Min Strategy Call →</a>
      </p>

      <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:32px">
        Reboost Marketing · You received this because you requested a free audit.
      </p>
    </div>
  </div>
</body>
</html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: `Your Free SEO Audit — ${businessName} scored ${score}/100`,
        html,
      }),
    });
    const data = await res.json();
    console.log('[Email] Sent:', data.id);
    return data;
  } catch (e) {
    console.error('[Email] Failed:', e.message);
    return null;
  }
}
