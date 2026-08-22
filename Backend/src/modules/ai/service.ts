import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error.middleware.js';
import { createTrip, addStop } from '../trips/trips.service.js';
import type { SuggestItineraryInput, AssistantChatInput } from './schema.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';

type ChatMessage = { role: string; content: string | null; tool_calls?: any[]; tool_call_id?: string };

const ASSISTANT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'navigate',
      description:
        'Take the user to a page in the app when they explicitly ask to go, open, or view something right now (e.g. "show my trips", "open the budget page", "take me to explore cities").',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            enum: ['/dashboard', '/trips', '/trips/new', '/cities', '/activities', '/profile'],
            description: 'The app route to navigate to.',
          },
        },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_trip',
      description:
        'Create a real new trip for the user right now when they ask to plan/create/start a trip, e.g. "create a 5 day trip to Bali starting next Friday". Resolve any relative dates (e.g. "next Friday", "in two weeks") into absolute ISO dates yourself using today\'s date, which is given in the system prompt.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'A short trip name, e.g. "Bali Getaway".' },
          startDate: { type: 'string', description: 'ISO date, YYYY-MM-DD.' },
          endDate: { type: 'string', description: 'ISO date, YYYY-MM-DD, on or after startDate.' },
          cityName: {
            type: 'string',
            description: 'Optional destination city name to add as the first stop, if the user named one.',
          },
        },
        required: ['name', 'startDate', 'endDate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_city',
      description:
        'Look up a specific city in the GlobeTrotter catalog when the user asks about a destination — its cost, popularity, or top activities.',
      parameters: {
        type: 'object',
        properties: {
          cityName: { type: 'string', description: 'The city name the user asked about.' },
        },
        required: ['cityName'],
      },
    },
  },
] as const;

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

  static async chatAssistant(userId: string, input: AssistantChatInput) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new AppError('The AI assistant is not configured on this server.', 503);
    }

    const today = new Date().toISOString().slice(0, 10);

    const systemPrompt = [
      'You are the in-app AI assistant for GlobeTrotter, a multi-city trip planning app.',
      `Today's date is ${today}.`,
      'Chat naturally, and use the provided tools to perform real actions in the app when the user is clearly asking you to DO something right now (not just talk about it) — navigating to a page, creating a trip, or looking up a city.',
      'Never call a tool for hypothetical or past-tense requests. Only call one tool per turn.',
      'Keep replies short and warm (1-3 sentences) — they render as chat bubbles.',
    ].join(' ');

    const history: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...input.messages.slice(-12).map((m) => ({ role: m.role, content: m.content })),
    ];

    const first = await callGroq(apiKey, history, { tools: ASSISTANT_TOOLS, tool_choice: 'auto', max_tokens: 400 });
    const firstMessage = first.choices?.[0]?.message;
    if (!firstMessage) throw new AppError('The AI assistant returned an empty response.', 502);

    const call = firstMessage.tool_calls?.[0];
    if (!call) {
      return { reply: firstMessage.content?.trim() || "Sorry, I didn't catch that — could you rephrase?", action: null };
    }

    let args: Record<string, any> = {};
    try {
      args = JSON.parse(call.function.arguments || '{}');
    } catch {
      // leave args empty; handlers below cope with missing fields
    }

    let toolResult: Record<string, any>;
    let action: { type: 'navigate'; path: string } | null = null;

    if (call.function.name === 'navigate' && typeof args.path === 'string') {
      toolResult = { ok: true, path: args.path };
      action = { type: 'navigate', path: args.path };
    } else if (call.function.name === 'create_trip' && args.name && args.startDate && args.endDate) {
      try {
        const trip = await createTrip(userId, {
          name: String(args.name),
          startDate: new Date(args.startDate),
          endDate: new Date(args.endDate),
        } as any);

        let cityAdded: string | null = null;
        if (args.cityName) {
          const city = await prisma.city.findFirst({
            where: { name: { contains: String(args.cityName), mode: 'insensitive' } },
          });
          if (city) {
            await addStop(userId, trip.id, {
              cityId: city.id,
              arrivalDate: new Date(args.startDate),
              departureDate: new Date(args.endDate),
            } as any);
            cityAdded = city.name;
          }
        }

        toolResult = { ok: true, tripId: trip.id, name: trip.name, cityAdded };
        action = { type: 'navigate', path: `/trips/${trip.id}/builder` };
      } catch (err: any) {
        toolResult = { ok: false, error: err?.message || 'Could not create the trip.' };
      }
    } else if (call.function.name === 'search_city' && args.cityName) {
      const city = await prisma.city.findFirst({
        where: { name: { contains: String(args.cityName), mode: 'insensitive' } },
        include: { activities: { orderBy: { cost: 'asc' }, take: 3 } },
      });
      toolResult = city
        ? {
            ok: true,
            name: city.name,
            country: city.country,
            popularityScore: city.popularityScore,
            costIndex: Number(city.costIndex),
            topActivities: city.activities.map((a) => a.name),
          }
        : { ok: false, error: `No city matching "${args.cityName}" was found in the catalog.` };
    } else {
      toolResult = { ok: false, error: 'That request was missing required details.' };
    }

    const followUp: ChatMessage[] = [
      ...history,
      { role: 'assistant', content: firstMessage.content ?? null, tool_calls: firstMessage.tool_calls },
      { role: 'tool', tool_call_id: call.id, content: JSON.stringify(toolResult) },
    ];

    try {
      const second = await callGroq(apiKey, followUp, { max_tokens: 300 });
      const finalContent = second.choices?.[0]?.message?.content?.trim();
      return { reply: finalContent || 'Done!', action: toolResult.ok ? action : null };
    } catch {
      // Tool executed fine even if the follow-up wording call failed — don't lose the action.
      const fallback = toolResult.ok
        ? 'Done!'
        : `Sorry — ${toolResult.error || 'something went wrong with that request.'}`;
      return { reply: fallback, action: toolResult.ok ? action : null };
    }
  }
}

async function callGroq(
  apiKey: string,
  messages: ChatMessage[],
  opts: { tools?: typeof ASSISTANT_TOOLS; tool_choice?: string; max_tokens: number },
) {
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
        messages,
        temperature: 0.5,
        max_tokens: opts.max_tokens,
        ...(opts.tools ? { tools: opts.tools, tool_choice: opts.tool_choice ?? 'auto' } : {}),
      }),
    });
  } catch {
    throw new AppError('Could not reach the AI provider. Please try again.', 502);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new AppError(`AI request failed (${res.status}). ${text.slice(0, 200)}`, 502);
  }

  return res.json() as Promise<{
    choices?: Array<{ message?: { content?: string | null; tool_calls?: any[] } }>;
  }>;
}
