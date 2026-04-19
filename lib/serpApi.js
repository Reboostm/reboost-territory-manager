const SERP_API_KEY = process.env.SERP_API_KEY;

export async function getMapPackResults(category, city, state) {
  if (!SERP_API_KEY) return null;
  const query = encodeURIComponent(`${category} in ${city} ${state}`);
  const url = `https://serpapi.com/search?engine=google_maps&q=${query}&type=search&api_key=${SERP_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.local_results || [];
}
