import {
  BudgetData,
  CalendarData,
  SharedItineraryData,
  AdminStats,
  TopCity,
  TopActivity,
  AdminUser,
  TripExpense,
  ExpenseCategory,
} from '../types/index.ts';
import { useAuthStore } from '../store/authStore.ts';

const API_BASE = '/api/v1';

// Budget/Calendar/trip-scoped Share all require a logged-in user on the backend —
// plain fetch() sends no Authorization header by default, so every one of these
// calls needs it attached explicitly (unlike the shared axios `api` client elsewhere,
// which does this automatically via an interceptor).
function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Initial Mock Trips and Data for offline/instant testing
export const MOCK_TRIP_ID = 'trip-goa-kerala-2026';
export const MOCK_SHARE_SLUG = 'summer-escapade-2026';

let mockExpenses: TripExpense[] = [
  {
    id: 'exp-1',
    tripId: MOCK_TRIP_ID,
    category: 'transport',
    amount: 12500,
    note: 'Flight from Mumbai to Goa (Indigo 6E 420)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    tripId: MOCK_TRIP_ID,
    category: 'stay',
    amount: 22000,
    note: '3 Nights at Taj Holiday Village Goa',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'exp-3',
    tripId: MOCK_TRIP_ID,
    category: 'meals',
    amount: 4800,
    note: 'Seafood dinner at Fisherman\'s Wharf',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'exp-4',
    tripId: MOCK_TRIP_ID,
    category: 'activities',
    amount: 3500,
    note: 'Scuba Diving at Grande Island',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: 'exp-5',
    tripId: MOCK_TRIP_ID,
    category: 'transport',
    amount: 6500,
    note: 'Self-drive Thar rental for 3 days',
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
  },
  {
    id: 'exp-6',
    tripId: MOCK_TRIP_ID,
    category: 'misc',
    amount: 1800,
    note: 'Sunscreen, beach mats & souvenirs',
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
  },
];

export const apiClient = {
  // -------------------------------------------------------------
  // Budget API (#9)
  // -------------------------------------------------------------
  async getBudget(tripId: string): Promise<BudgetData> {
    try {
      const res = await fetch(`${API_BASE}/trips/${tripId}/budget`, { headers: authHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch {
      // Backend offline: use mock
    }

    const currentExpenses = mockExpenses.filter((e) => e.tripId === tripId || tripId === MOCK_TRIP_ID);
    const categoryBreakdown = {
      transport: 0,
      stay: 0,
      activities: 0,
      meals: 0,
      misc: 0,
    };

    currentExpenses.forEach((e) => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + Number(e.amount);
    });

    const totalBudget = 65000;
    const totalSpent = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0);
    const remaining = totalBudget - totalSpent;

    let status: 'within' | 'warning' | 'danger' = 'within';
    if ((totalSpent / totalBudget) > 1) status = 'danger';
    else if ((totalSpent / totalBudget) >= 0.8) status = 'warning';

    const durationDays = 6;
    return {
      tripId,
      tripName: 'Goa & Kerala Tropical Escape',
      totalBudget,
      totalSpent,
      remaining,
      status,
      durationDays,
      dailyBudget: Math.round(totalBudget / durationDays),
      dailyAverageSpent: Math.round(totalSpent / durationDays),
      categoryBreakdown,
      expenses: currentExpenses,
      activityCostsCount: 5,
    };
  },

  async addExpense(tripId: string, data: { category: ExpenseCategory; amount: number; note?: string }): Promise<TripExpense> {
    try {
      const res = await fetch(`${API_BASE}/trips/${tripId}/budget/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch {
      // fallback
    }

    const newExpense: TripExpense = {
      id: `exp-${Date.now()}`,
      tripId,
      category: data.category,
      amount: data.amount,
      note: data.note,
      createdAt: new Date().toISOString(),
    };
    mockExpenses = [newExpense, ...mockExpenses];
    return newExpense;
  },

  async deleteExpense(expenseId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/trips/${MOCK_TRIP_ID}/budget/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (res.ok) return true;
    } catch {
      // fallback
    }
    mockExpenses = mockExpenses.filter((e) => e.id !== expenseId);
    return true;
  },

  // -------------------------------------------------------------
  // Calendar & Timeline API (#10)
  // -------------------------------------------------------------
  async getCalendar(tripId: string): Promise<CalendarData> {
    try {
      const res = await fetch(`${API_BASE}/trips/${tripId}/calendar`, { headers: authHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch {
      // fallback
    }

    return {
      trip: {
        id: tripId,
        name: 'Goa & Kerala Coastal Adventure',
        description: '6-day sun, sand, spice plantations and backwaters experience.',
        startDate: '2026-09-10',
        endDate: '2026-09-15',
        coverPhotoUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&auto=format&fit=crop&q=80',
        totalBudget: 65000,
        status: 'planned',
      },
      totalDays: 6,
      days: [
        {
          date: '2026-09-10',
          dayNumber: 1,
          cityStop: {
            id: 'stop-1',
            cityName: 'North Goa',
            country: 'India',
            imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
          },
          activities: [
            {
              id: 'act-101',
              name: 'Check-in & Calangute Beach Sunset',
              category: 'sightseeing',
              description: 'Relax after arrival and watch the sunset over the Arabian Sea.',
              scheduledDate: '2026-09-10',
              scheduledTime: '16:00',
              actualCost: 500,
              durationMinutes: 120,
              orderIndex: 1,
              imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
            },
            {
              id: 'act-102',
              name: 'Beach Shack Seafood Dinner',
              category: 'food',
              description: 'Goan fish curry, butter garlic prawns and cold drinks at Curlies.',
              scheduledDate: '2026-09-10',
              scheduledTime: '20:00',
              actualCost: 2200,
              durationMinutes: 90,
              orderIndex: 2,
              imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            },
          ],
        },
        {
          date: '2026-09-11',
          dayNumber: 2,
          cityStop: {
            id: 'stop-1',
            cityName: 'North Goa',
            country: 'India',
            imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
          },
          activities: [
            {
              id: 'act-103',
              name: 'Scuba Diving & Coral Safari',
              category: 'adventure',
              description: 'Boat ride to Grande Island for guided diving with certified instructors.',
              scheduledDate: '2026-09-11',
              scheduledTime: '08:30',
              actualCost: 3500,
              durationMinutes: 240,
              orderIndex: 1,
              imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=80',
            },
            {
              id: 'act-104',
              name: 'Aguada Fort & Lighthouse Exploration',
              category: 'culture',
              description: '17th-century Portuguese fortress offering panoramic coastal viewpoints.',
              scheduledDate: '2026-09-11',
              scheduledTime: '16:30',
              actualCost: 200,
              durationMinutes: 90,
              orderIndex: 2,
              imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=500&auto=format&fit=crop&q=80',
            },
            {
              id: 'act-105',
              name: 'Night Market & Live Music in Anjuna',
              category: 'nightlife',
              description: 'Vibrant flea market, artisan stalls, live indie bands and street food.',
              scheduledDate: '2026-09-11',
              scheduledTime: '20:30',
              actualCost: 1500,
              durationMinutes: 150,
              orderIndex: 3,
              imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80',
            },
          ],
        },
        {
          date: '2026-09-12',
          dayNumber: 3,
          cityStop: {
            id: 'stop-2',
            cityName: 'South Goa Heritage',
            country: 'India',
            imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop&q=80',
          },
          activities: [
            {
              id: 'act-106',
              name: 'Basilica of Bom Jesus & Old Goa',
              category: 'culture',
              description: 'UNESCO World Heritage site holding the mortal remains of St. Francis Xavier.',
              scheduledDate: '2026-09-12',
              scheduledTime: '10:00',
              actualCost: 100,
              durationMinutes: 120,
              orderIndex: 1,
              imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=500&auto=format&fit=crop&q=80',
            },
            {
              id: 'act-107',
              name: 'Dudhsagar Waterfalls Trek & Jeep Safari',
              category: 'adventure',
              description: 'Four-tiered majestic waterfall in Bhagwan Mahaveer Sanctuary.',
              scheduledDate: '2026-09-12',
              scheduledTime: '14:00',
              actualCost: 2800,
              durationMinutes: 210,
              orderIndex: 2,
              imageUrl: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=500&auto=format&fit=crop&q=80',
            },
          ],
        },
        {
          date: '2026-09-13',
          dayNumber: 4,
          cityStop: {
            id: 'stop-3',
            cityName: 'Kochi',
            country: 'India',
            imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format&fit=crop&q=80',
          },
          activities: [
            {
              id: 'act-108',
              name: 'Flight to Kochi & Fort Kochi Heritage Walk',
              category: 'sightseeing',
              description: 'See the iconic cantilevered Chinese Fishing Nets and colonial streets.',
              scheduledDate: '2026-09-13',
              scheduledTime: '11:00',
              actualCost: 4200,
              durationMinutes: 180,
              orderIndex: 1,
              imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=500&auto=format&fit=crop&q=80',
            },
            {
              id: 'act-109',
              name: 'Kathakali Dance Performance & Makeup Demo',
              category: 'culture',
              description: 'Classical Indian dance-drama with intricate makeup and storytelling.',
              scheduledDate: '2026-09-13',
              scheduledTime: '18:30',
              actualCost: 800,
              durationMinutes: 90,
              orderIndex: 2,
              imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=500&auto=format&fit=crop&q=80',
            },
          ],
        },
        {
          date: '2026-09-14',
          dayNumber: 5,
          cityStop: {
            id: 'stop-4',
            cityName: 'Alleppey Backwaters',
            country: 'India',
            imageUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=600&auto=format&fit=crop&q=80',
          },
          activities: [
            {
              id: 'act-110',
              name: 'Traditional Kettuvallam Houseboat Cruise',
              category: 'sightseeing',
              description: 'Sail through lush green canals, paddy fields and village waterways with fresh Kerala meals.',
              scheduledDate: '2026-09-14',
              scheduledTime: '12:00',
              actualCost: 8500,
              durationMinutes: 360,
              orderIndex: 1,
              imageUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=500&auto=format&fit=crop&q=80',
            },
          ],
        },
        {
          date: '2026-09-15',
          dayNumber: 6,
          cityStop: {
            id: 'stop-4',
            cityName: 'Alleppey & Kochi',
            country: 'India',
            imageUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=600&auto=format&fit=crop&q=80',
          },
          activities: [
            {
              id: 'act-111',
              name: 'Spice Market Shopping & Ayurvedic Massage',
              category: 'meals',
              description: 'Authentic cardamom, black pepper, vanilla and an invigorating abhyanga session.',
              scheduledDate: '2026-09-15',
              scheduledTime: '10:00',
              actualCost: 2500,
              durationMinutes: 120,
              orderIndex: 1,
              imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80',
            },
          ],
        },
      ],
    };
  },

  // -------------------------------------------------------------
  // Share API (#11)
  // -------------------------------------------------------------
  async getSharedTrip(slug: string): Promise<SharedItineraryData> {
    try {
      const res = await fetch(`${API_BASE}/share/${slug}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch {
      // fallback
    }

    return {
      shareLink: {
        slug: slug || MOCK_SHARE_SLUG,
        allowCopy: true,
        createdAt: '2026-08-20T10:00:00.000Z',
      },
      trip: {
        id: MOCK_TRIP_ID,
        name: 'The Grand South India Coastal Expedition',
        description: 'Sunsets in Goa, Portuguese heritage, Dudhsagar waterfalls and sleepy backwaters in Alleppey.',
        startDate: '2026-09-10',
        endDate: '2026-09-15',
        coverPhotoUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&auto=format&fit=crop&q=80',
        totalBudget: 65000,
        estimatedTotalCost: 51200,
        author: {
          id: 'user-purva-01',
          name: 'Purva Sharma',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        },
        stops: [
          {
            id: 'stop-1',
            city: {
              id: 'city-goa',
              name: 'Goa',
              country: 'India',
              imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
            },
            arrivalDate: '2026-09-10',
            departureDate: '2026-09-12',
            orderIndex: 0,
            activities: [
              {
                id: 'act-1',
                name: 'Scuba Diving at Grande Island',
                category: 'adventure',
                description: 'Explore coral reefs, exotic marine life and shipwrecks with PADI instructors.',
                cost: 3500,
                durationMinutes: 240,
                scheduledDate: '2026-09-11',
                scheduledTime: '08:30 AM',
                imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=80',
              },
              {
                id: 'act-2',
                name: 'Aguada Fort Sunset Walk',
                category: 'sightseeing',
                description: 'Panoramic views over Sinquerim beach and the Arabian Sea.',
                cost: 200,
                durationMinutes: 90,
                scheduledDate: '2026-09-11',
                scheduledTime: '05:00 PM',
                imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
              },
            ],
          },
          {
            id: 'stop-2',
            city: {
              id: 'city-kochi',
              name: 'Kochi & Alleppey',
              country: 'India',
              imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format&fit=crop&q=80',
            },
            arrivalDate: '2026-09-13',
            departureDate: '2026-09-15',
            orderIndex: 1,
            activities: [
              {
                id: 'act-3',
                name: 'Alleppey Backwaters Houseboat Stay',
                category: 'sightseeing',
                description: 'Private wooden boat gliding across canals with traditional meals.',
                cost: 8500,
                durationMinutes: 360,
                scheduledDate: '2026-09-14',
                scheduledTime: '12:00 PM',
                imageUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=500&auto=format&fit=crop&q=80',
              },
            ],
          },
        ],
      },
    };
  },

  async createShareLink(tripId: string): Promise<{ publicSlug: string }> {
    try {
      const res = await fetch(`${API_BASE}/trips/${tripId}/share`, { method: 'POST', headers: authHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return { publicSlug: json.data.publicSlug };
      }
    } catch {
      // fallback
    }
    return { publicSlug: MOCK_SHARE_SLUG };
  },

  async copySharedTrip(slug: string, newName?: string): Promise<{ success: boolean; tripId: string }> {
    try {
      const res = await fetch(`${API_BASE}/share/${slug}/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName }),
      });
      if (res.ok) {
        const json = await res.json();
        return { success: true, tripId: json.data.id };
      }
    } catch {
      // fallback
    }
    return { success: true, tripId: `trip-copy-${Date.now()}` };
  },

  // -------------------------------------------------------------
  // Admin & Analytics API (#13)
  // -------------------------------------------------------------
  async getAdminStats(): Promise<{
    stats: AdminStats;
    topCities: TopCity[];
    topActivities: TopActivity[];
    users: AdminUser[];
  }> {
    try {
      const [resStats, resCities, resActs, resUsers] = await Promise.all([
        fetch(`${API_BASE}/admin/stats/overview`),
        fetch(`${API_BASE}/admin/stats/top-cities`),
        fetch(`${API_BASE}/admin/stats/top-activities`),
        fetch(`${API_BASE}/admin/users`),
      ]);

      if (resStats.ok && resCities.ok && resActs.ok && resUsers.ok) {
        const [jsonStats, jsonCities, jsonActs, jsonUsers] = await Promise.all([
          resStats.json(),
          resCities.json(),
          resActs.json(),
          resUsers.json(),
        ]);
        return {
          stats: jsonStats.data,
          topCities: jsonCities.data,
          topActivities: jsonActs.data,
          users: jsonUsers.data,
        };
      }
    } catch {
      // fallback
    }

    return {
      stats: {
        totalUsers: 1420,
        totalTrips: 3840,
        totalCities: 64,
        totalActivities: 310,
        totalBudgetVolume: 24800000,
        avgBudget: 64500,
        tripsByStatus: {
          draft: 820,
          planned: 2150,
          completed: 870,
        },
        signupsByMonth: [
          { month: 'Jan', signups: 85, trips: 62 },
          { month: 'Feb', signups: 130, trips: 110 },
          { month: 'Mar', signups: 195, trips: 175 },
          { month: 'Apr', signups: 260, trips: 230 },
          { month: 'May', signups: 340, trips: 315 },
          { month: 'Jun', signups: 410, trips: 390 },
        ],
      },
      topCities: [
        { name: 'Goa', country: 'India', count: 1240, imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&auto=format&fit=crop&q=80' },
        { name: 'Kerala', country: 'India', count: 980, imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&auto=format&fit=crop&q=80' },
        { name: 'Jaipur', country: 'India', count: 760, imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&auto=format&fit=crop&q=80' },
        { name: 'Manali', country: 'India', count: 540, imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&auto=format&fit=crop&q=80' },
        { name: 'Mumbai', country: 'India', count: 430, imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&auto=format&fit=crop&q=80' },
      ],
      topActivities: [
        { category: 'Sightseeing & Heritage', count: 1650, percentage: 42 },
        { category: 'Food & Culinary Tours', count: 1120, percentage: 28 },
        { category: 'Adventure & Water Sports', count: 680, percentage: 17 },
        { category: 'Culture & Arts', count: 320, percentage: 8 },
        { category: 'Nightlife & Lounges', count: 190, percentage: 5 },
      ],
      users: [
        { id: 'usr-1', name: 'Purva Sharma', email: 'purva@globetrotter.io', role: 'admin', createdAt: '2026-08-01', _count: { trips: 14 } },
        { id: 'usr-2', name: 'Aarav Patel', email: 'aarav.patel@gmail.com', role: 'user', createdAt: '2026-08-05', _count: { trips: 6 } },
        { id: 'usr-3', name: 'Ananya Rao', email: 'ananya.travels@outlook.com', role: 'user', createdAt: '2026-08-10', _count: { trips: 9 } },
        { id: 'usr-4', name: 'Rohan Mehra', email: 'rohan.mehra@tech.in', role: 'user', createdAt: '2026-08-14', _count: { trips: 3 } },
        { id: 'usr-5', name: 'Zoya Khan', email: 'zoya.explores@gmail.com', role: 'user', createdAt: '2026-08-18', _count: { trips: 8 } },
      ],
    };
  },
};
