const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function findBusiness(businessName, city, state) {
  if (!API_KEY) return null;
  const query = encodeURIComponent(`${businessName} ${city} ${state}`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results?.[0] || null;
}

export async function getPlaceDetails(placeId) {
  if (!API_KEY) return null;
  const fields = 'name,rating,user_ratings_total,photos,formatted_address,formatted_phone_number,opening_hours,website,geometry,types,editorial_summary';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.result || null;
}
