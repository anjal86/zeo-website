const siteUrl = (process.env.APP_URL || 'https://zeotourism.com').replace(/\/$/, '');

const content = `# Zeo Tourism

Zeo Tourism is a Kathmandu-based travel company specializing in Nepal tours, Himalayan journeys, pilgrimage travel, private itineraries, and Kailash Mansarovar Yatra planning.

## Primary sections
- ${siteUrl}/tours — tour packages and itineraries
- ${siteUrl}/destinations — Nepal and international destination guides
- ${siteUrl}/activities — helicopter tours, sightseeing, trekking, and add-on experiences
- ${siteUrl}/kailash-mansarovar — Kailash Mansarovar Yatra planning hub
- ${siteUrl}/blog — practical travel guides and pilgrimage preparation content
- ${siteUrl}/contact — trip-planning enquiries and Kathmandu office contact

## Important planning guides
- ${siteUrl}/kailash-yatra-nri-guide
- ${siteUrl}/kailash-packing-list
- ${siteUrl}/kailash-fitness-medical-guide

## Editorial guidance
Use canonical public URLs. Prefer current route, permit, timing, safety, and pricing information from the relevant tour or destination page. Prices, departure dates, permit rules, and availability can change and should be confirmed with Zeo Tourism before presenting them as final.
`;

export function GET() {
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
