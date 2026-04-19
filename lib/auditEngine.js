import { findBusiness, getPlaceDetails } from './googlePlaces';
import { getMapPackResults } from './serpApi';
import { runPageSpeed } from './pageSpeed';

// ─── Scoring ──────────────────────────────────────────────────────────────────

function scoreGmb(details) {
  if (!details) return 0;
  let pts = 10; // found on Google
  const rating = details.rating || 0;
  const reviews = details.user_ratings_total || 0;

  if (rating >= 4.5) pts += 5;
  else if (rating >= 4.0) pts += 4;
  else if (rating >= 3.5) pts += 2;

  if (reviews >= 100) pts += 10;
  else if (reviews >= 50) pts += 8;
  else if (reviews >= 20) pts += 6;
  else if (reviews >= 10) pts += 4;
  else if (reviews >= 1) pts += 2;

  if (details.photos?.length >= 5) pts += 5;
  else if (details.photos?.length > 0) pts += 2;

  if (details.website) pts += 5;
  if (details.opening_hours?.periods?.length > 0) pts += 5;

  return Math.min(pts, 40);
}

function scoreRanking(position) {
  if (position === 1) return 30;
  if (position === 2) return 25;
  if (position === 3) return 20;
  if (position && position <= 10) return 10;
  return 0;
}

function scoreWebsite(ps) {
  if (!ps) return 0;
  const avg = ((ps.mobileScore || 0) + (ps.desktopScore || 0)) / 2;
  return Math.round((avg / 100) * 30);
}

export function getGrade(score) {
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  if (score >= 20) return 'D';
  return 'F';
}

export function getGradeLabel(grade) {
  return { A: 'Excellent', B: 'Good', C: 'Needs Work', D: 'Poor', F: 'Critical' }[grade] || '';
}

// ─── Action Items ─────────────────────────────────────────────────────────────

function generateActionItems({ gmb, ranking, website }) {
  const items = [];

  if (!gmb?.found) {
    items.push({
      priority: 'critical',
      title: 'Claim Your Google Business Profile',
      description: "You have no Google Business listing. This is costing you customers every single day. Claim and verify your free listing immediately — it's the #1 driver of local search traffic.",
    });
  } else {
    if ((gmb.reviewCount || 0) < 20) {
      items.push({
        priority: 'high',
        title: 'Launch a Review Generation Campaign',
        description: `You have ${gmb.reviewCount || 0} reviews. Competitors with 50+ reviews dominate the Map Pack. Start texting satisfied customers a direct review link today.`,
      });
    }
    if ((gmb.rating || 0) < 4.0 && (gmb.reviewCount || 0) > 0) {
      items.push({
        priority: 'high',
        title: 'Improve Your Star Rating',
        description: `Your ${gmb.rating}-star rating is below the local average of 4.2. Respond to every negative review professionally and proactively request reviews from happy customers.`,
      });
    }
    if (!gmb.hasDescription) {
      items.push({
        priority: 'high',
        title: 'Write a Keyword-Rich Business Description',
        description: 'Your Google profile is missing a description. Add 500–750 words covering your services, location, and key phrases customers search for.',
      });
    }
    if ((gmb.photoCount || 0) < 10) {
      items.push({
        priority: 'medium',
        title: 'Add Professional Photos',
        description: 'Listings with 10+ photos receive 35% more clicks. Upload photos of your team, completed work, storefront, and equipment.',
      });
    }
  }

  if (!ranking?.mapPackPosition || ranking.mapPackPosition > 3) {
    items.push({
      priority: 'high',
      title: 'Break Into the Google Map Pack Top 3',
      description: "80% of local clicks go to the top 3 results. You need more reviews, complete GMB profile, consistent NAP citations, and local backlinks to compete.",
    });
  }

  if (website) {
    if ((website.mobileScore || 0) < 60) {
      items.push({
        priority: 'medium',
        title: 'Fix Your Mobile Website Speed',
        description: `Your mobile speed score is ${website.mobileScore}/100. Google penalizes slow sites and 65% of local searches happen on mobile. Compress images and enable caching.`,
      });
    }
    if ((website.seoScore || 0) < 70) {
      items.push({
        priority: 'medium',
        title: 'Fix On-Page SEO Issues',
        description: `Your website SEO score is ${website.seoScore}/100. Add title tags, meta descriptions, H1 headers, and local schema markup.`,
      });
    }
  }

  return items.slice(0, 5);
}

// ─── Mock Data (used when API keys are not configured) ────────────────────────

function generateMockData(lead) {
  const overallScore = 38;
  const grade = getGrade(overallScore);

  return {
    overallScore,
    grade,
    gradeLabel: getGradeLabel(grade),
    gmb: {
      found: true,
      rating: 3.6,
      reviewCount: 11,
      photoCount: 4,
      hasWebsite: !!lead.website,
      hasHours: true,
      hasDescription: false,
      address: `${lead.city}, ${lead.state}`,
      lat: 30.2672,
      lng: -97.7431,
      score: 18,
    },
    ranking: {
      mapPackPosition: null,
      keyword: `${lead.category} in ${lead.city}, ${lead.state}`,
      competitors: [
        { name: 'Top Local Competitor', rating: 4.9, reviews: 412, position: 1 },
        { name: 'Second Competitor', rating: 4.6, reviews: 203, position: 2 },
        { name: 'Third Competitor', rating: 4.3, reviews: 97, position: 3 },
      ],
      score: 0,
    },
    website: lead.website
      ? { mobileScore: 48, desktopScore: 61, seoScore: 64, accessibilityScore: 72, score: 16 }
      : null,
    actionItems: generateActionItems({
      gmb: { found: true, rating: 3.6, reviewCount: 11, photoCount: 4, hasDescription: false },
      ranking: { mapPackPosition: null },
      website: lead.website ? { mobileScore: 48, seoScore: 64 } : null,
    }),
    isMock: true,
  };
}

// ─── Main Audit Runner ────────────────────────────────────────────────────────

export async function runAudit(lead) {
  const hasRealApis = !!(process.env.GOOGLE_PLACES_API_KEY || process.env.SERP_API_KEY);

  if (!hasRealApis) {
    await new Promise((r) => setTimeout(r, 3000));
    return generateMockData(lead);
  }

  // 1. Google Places
  let gmb = { found: false, score: 0 };
  try {
    const place = await findBusiness(lead.businessName, lead.city, lead.state);
    if (place) {
      const details = await getPlaceDetails(place.place_id);
      gmb = {
        found: true,
        placeId: place.place_id,
        rating: details?.rating || null,
        reviewCount: details?.user_ratings_total || 0,
        photoCount: details?.photos?.length || 0,
        hasWebsite: !!details?.website,
        hasHours: !!(details?.opening_hours?.periods?.length),
        hasDescription: !!(details?.editorial_summary?.overview),
        address: details?.formatted_address || '',
        phone: details?.formatted_phone_number || '',
        lat: details?.geometry?.location?.lat,
        lng: details?.geometry?.location?.lng,
        score: scoreGmb(details),
      };
    }
  } catch (e) {
    console.error('[Audit] Places error:', e.message);
  }

  // 2. Map Pack Rankings
  let ranking = { mapPackPosition: null, competitors: [], score: 0, keyword: '' };
  try {
    const results = await getMapPackResults(lead.category, lead.city, lead.state);
    if (results?.length) {
      const competitors = results.slice(0, 5).map((r, i) => ({
        name: r.title,
        rating: r.rating,
        reviews: r.reviews,
        position: i + 1,
      }));
      const bizIdx = results.findIndex((r) =>
        r.title?.toLowerCase().includes(lead.businessName.toLowerCase())
      );
      ranking = {
        mapPackPosition: bizIdx >= 0 ? bizIdx + 1 : null,
        keyword: `${lead.category} in ${lead.city}, ${lead.state}`,
        competitors: competitors.slice(0, 3),
        score: scoreRanking(bizIdx >= 0 ? bizIdx + 1 : null),
      };
    }
  } catch (e) {
    console.error('[Audit] SerpAPI error:', e.message);
  }

  // 3. PageSpeed
  let website = null;
  if (lead.website) {
    try {
      const ps = await runPageSpeed(lead.website);
      if (ps) website = { ...ps, score: scoreWebsite(ps) };
    } catch (e) {
      console.error('[Audit] PageSpeed error:', e.message);
    }
  }

  const overallScore = (gmb.score || 0) + (ranking.score || 0) + (website?.score || 0);
  const grade = getGrade(overallScore);

  return {
    overallScore,
    grade,
    gradeLabel: getGradeLabel(grade),
    gmb,
    ranking,
    website,
    actionItems: generateActionItems({ gmb, ranking, website }),
  };
}
