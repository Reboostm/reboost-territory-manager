const GHL_API_KEY = process.env.GHL_API_KEY;

export async function pushLeadToGHL({ firstName, lastName, email, phone, businessName, score, grade, reportUrl, city, state }) {
  if (!GHL_API_KEY) {
    console.log('[GHL] API key not set — skipping push');
    return null;
  }

  const body = {
    firstName,
    lastName,
    email,
    phone,
    name: `${firstName} ${lastName}`,
    companyName: businessName,
    city,
    state,
    source: 'SEO Audit Tool',
    tags: ['seo-audit-lead', 'free-audit'],
    customField: {
      audit_score: String(score),
      audit_grade: grade,
      business_name: businessName,
      report_url: reportUrl,
    },
  };

  try {
    const res = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    console.log('[GHL] Contact pushed:', data?.contact?.id || 'unknown id');
    return data;
  } catch (e) {
    console.error('[GHL] Push failed:', e.message);
    return null;
  }
}
