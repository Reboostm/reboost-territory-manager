const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function runPageSpeed(websiteUrl) {
  if (!websiteUrl) return null;
  let url = websiteUrl;
  if (!url.startsWith('http')) url = `https://${url}`;

  const keyParam = API_KEY ? `&key=${API_KEY}` : '';
  const build = (strategy) =>
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}${keyParam}`;

  try {
    const [mobileRes, desktopRes] = await Promise.allSettled([
      fetch(build('mobile')).then((r) => r.json()),
      fetch(build('desktop')).then((r) => r.json()),
    ]);

    const mobile = mobileRes.status === 'fulfilled' ? mobileRes.value : null;
    const desktop = desktopRes.status === 'fulfilled' ? desktopRes.value : null;

    const score = (obj, cat) =>
      obj?.lighthouseResult?.categories?.[cat]?.score != null
        ? Math.round(obj.lighthouseResult.categories[cat].score * 100)
        : null;

    return {
      mobileScore: score(mobile, 'performance'),
      desktopScore: score(desktop, 'performance'),
      seoScore: score(mobile, 'seo'),
      accessibilityScore: score(mobile, 'accessibility'),
      lcp: mobile?.lighthouseResult?.audits?.['largest-contentful-paint']?.displayValue || null,
      cls: mobile?.lighthouseResult?.audits?.['cumulative-layout-shift']?.displayValue || null,
    };
  } catch {
    return null;
  }
}
