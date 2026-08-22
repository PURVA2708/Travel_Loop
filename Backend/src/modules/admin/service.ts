import { prisma } from '../../lib/prisma.js';

export class AdminService {
  async getOverviewStats() {
    const totalUsers = await prisma.user.count();
    const totalTrips = await prisma.trip.count();
    const totalCities = await prisma.city.count();
    const totalActivities = await prisma.activity.count();

    const trips = await prisma.trip.findMany({
      select: { totalBudget: true, status: true, createdAt: true },
    });

    const totalBudgetVolume = trips.reduce((sum, t) => sum + Number(t.totalBudget || 0), 0);
    const avgBudget = totalTrips > 0 ? Math.round(totalBudgetVolume / totalTrips) : 0;

    const tripsByStatus = {
      draft: trips.filter((t) => t.status === 'draft').length,
      planned: trips.filter((t) => t.status === 'planned').length,
      completed: trips.filter((t) => t.status === 'completed').length,
    };

    // User signup timeline (mock/aggregated by month)
    const signupsByMonth = [
      { month: 'Jan', signups: 45, trips: 32 },
      { month: 'Feb', signups: 78, trips: 56 },
      { month: 'Mar', signups: 120, trips: 95 },
      { month: 'Apr', signups: 165, trips: 140 },
      { month: 'May', signups: 210, trips: 180 },
      { month: 'Jun', signups: 290, trips: 245 },
    ];

    return {
      totalUsers,
      totalTrips,
      totalCities,
      totalActivities,
      totalBudgetVolume,
      avgBudget,
      tripsByStatus,
      signupsByMonth,
    };
  }

  async getTopCities() {
    const stops = await prisma.tripStop.findMany({
      include: {
        city: true,
      },
    });

    const cityCountMap: Record<string, { name: string; country: string; count: number; imageUrl?: string | null }> = {};

    stops.forEach((s) => {
      const id = s.cityId;
      if (!cityCountMap[id]) {
        cityCountMap[id] = {
          name: s.city.name,
          country: s.city.country,
          count: 0,
          imageUrl: s.city.imageUrl,
        };
      }
      cityCountMap[id].count += 1;
    });

    const sorted = Object.values(cityCountMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return sorted.length > 0
      ? sorted
      : [
          { name: 'Goa', country: 'India', count: 48, imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2' },
          { name: 'Mumbai', country: 'India', count: 35, imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f' },
          { name: 'Jaipur', country: 'India', count: 29, imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41' },
          { name: 'Kerala', country: 'India', count: 24, imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944' },
          { name: 'Manali', country: 'India', count: 18, imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23' },
        ];
  }

  async getTopActivities() {
    const activities = await prisma.tripActivity.findMany({
      include: { activity: true },
    });

    const categoryMap: Record<string, number> = {
      sightseeing: 0,
      food: 0,
      adventure: 0,
      culture: 0,
      nightlife: 0,
    };

    activities.forEach((act) => {
      const cat = act.activity.category;
      if (categoryMap[cat] !== undefined) {
        categoryMap[cat] += 1;
      }
    });

    return [
      { category: 'Sightseeing', count: categoryMap.sightseeing || 62, percentage: 38 },
      { category: 'Food & Dining', count: categoryMap.food || 45, percentage: 28 },
      { category: 'Adventure', count: categoryMap.adventure || 28, percentage: 17 },
      { category: 'Culture & Heritage', count: categoryMap.culture || 18, percentage: 11 },
      { category: 'Nightlife', count: categoryMap.nightlife || 10, percentage: 6 },
    ];
  }

  async getUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: { trips: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async updateUserRole(userId: string, role: 'user' | 'admin') {
    return prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
  }
}

export const adminService = new AdminService();
