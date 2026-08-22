import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error.middleware.js';
import type { SuggestItineraryInput } from './schema.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';

export class AiService {
  static async suggestItinerary(input: SuggestItineraryInput) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new AppError('AI suggestions are not configured on this server.', 503);
    }

    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    const tripDays = Math.max(Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1, 1);

    const cities = await prisma.city.findMany({
      include: { activities: true },
      orderBy: { popularityScore: 'desc' },
      take: 20,
    });

    const catalog = cities.map((c) => ({
      cityId: c.id,
      name: c.name,
      country: c.country,
      region: c.region,
      popularity: c.popularityScore,
      costIndex: Number(c.costIndex),
      activities: c.activities.map((a) => ({
        activityId: a.id,
        name: a.name,
        category: a.category,
        cost: Number(a.cost),
        durationMinutes: a.durationMinutes,
      })),
    }));

    const systemPrompt = [
      'You are a travel planning assistant for a trip planner app called GlobeTrotter.',
      `Given a catalog of cities and their available activities, pick a sensible multi-city itinerary for a trip lasting ${tripDays} day(s).`,
      'Only use cityId and activityId values that literally exist in the catalog provided — never invent new ones.',
      'Prefer 1 city for short trips (up to 4 days) and 2-3 complementary cities for longer trips.',
      'Pick 2-4 activities per selected city that fit the trip length and the traveler\'s interests.',
      'Respond with STRICT JSON only, no prose, no markdown fences, matching exactly this shape:',
      '{"rationale": string, "cityIds": string[], "activityIds": string[]}',
    ].join(' ');

    const userPrompt = [
      `Trip length: ${tripDays} day(s).`,
      input.interests ? `Traveler interests: ${input.interests}.` : '',
      '',
      'Catalog:',
      JSON.stringify(catalog),
    ].join('\n');

    let res: Response;
    try {
      res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.4,
          max_tokens: 1024,
        }),
      });
    } catch {
      throw new AppError('Could not reach the AI provider. Please try again.', 502);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new AppError(`AI suggestion request failed (${res.status}). ${text.slice(0, 200)}`, 502);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) throw new AppError('AI returned an empty response.', 502);

    let parsed: { rationale?: string; cityIds?: string[]; activityIds?: string[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new AppError('AI returned a response that could not be understood.', 502);
    }

    const cityIdSet = new Set(catalog.map((c) => c.cityId));
    const validCityIds = (parsed.cityIds ?? []).filter((id) => cityIdSet.has(id));
    if (validCityIds.length === 0) {
      throw new AppError('AI could not find a matching itinerary. Try adjusting your dates or interests.', 502);
    }

    const activityIdSet = new Set(
      catalog.flatMap((c) => (validCityIds.includes(c.cityId) ? c.activities.map((a) => a.activityId) : [])),
    );
    const validActivityIds = (parsed.activityIds ?? []).filter((id) => activityIdSet.has(id));

    const selectedCities = cities
      .filter((c) => validCityIds.includes(c.id))
      .sort((a, b) => validCityIds.indexOf(a.id) - validCityIds.indexOf(b.id));

    const selectedActivities = selectedCities.flatMap((c) =>
      c.activities.filter((a) => validActivityIds.includes(a.id)),
    );

    return {
      rationale: parsed.rationale ?? 'Here is an itinerary tailored to your trip length.',
      cities: selectedCities.map((c) => ({
        id: c.id,
        name: c.name,
        country: c.country,
        region: c.region,
        costIndex: c.costIndex.toString(),
        popularityScore: c.popularityScore,
        imageUrl: c.imageUrl,
        lat: c.lat?.toString() ?? null,
        lng: c.lng?.toString() ?? null,
      })),
      activities: selectedActivities.map((a) => ({
        id: a.id,
        cityId: a.cityId,
        name: a.name,
        description: a.description,
        category: a.category,
        cost: a.cost.toString(),
        durationMinutes: a.durationMinutes,
        imageUrl: a.imageUrl,
      })),
    };
  }
}
