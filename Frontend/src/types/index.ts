export type ExpenseCategory = 'transport' | 'stay' | 'activities' | 'meals' | 'misc';

export interface TripExpense {
  id: string;
  tripId: string;
  category: ExpenseCategory;
  amount: number;
  note?: string;
  createdAt: string;
}

export interface BudgetData {
  tripId: string;
  tripName: string;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  status: 'within' | 'warning' | 'danger';
  durationDays: number;
  dailyBudget: number;
  dailyAverageSpent: number;
  categoryBreakdown: {
    transport: number;
    stay: number;
    activities: number;
    meals: number;
    misc: number;
  };
  expenses: TripExpense[];
  activityCostsCount: number;
}

export interface ScheduledActivity {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  scheduledDate?: string;
  scheduledTime?: string | null;
  actualCost: number;
  durationMinutes: number;
  imageUrl?: string | null;
  orderIndex: number;
}

export interface DaySchedule {
  date: string;
  dayNumber: number;
  cityStop?: {
    id: string;
    cityName: string;
    country: string;
    imageUrl?: string | null;
  };
  activities: ScheduledActivity[];
}

export interface CalendarData {
  trip: {
    id: string;
    name: string;
    description?: string | null;
    startDate: string;
    endDate: string;
    coverPhotoUrl?: string | null;
    totalBudget: number;
    status: string;
  };
  totalDays: number;
  days: DaySchedule[];
}

export interface SharedItineraryData {
  shareLink: {
    slug: string;
    allowCopy: boolean;
    createdAt: string;
  };
  trip: {
    id: string;
    name: string;
    description?: string | null;
    startDate: string;
    endDate: string;
    coverPhotoUrl?: string | null;
    totalBudget: number;
    estimatedTotalCost: number;
    author: {
      id: string;
      name: string;
      avatarUrl?: string | null;
    };
    stops: Array<{
      id: string;
      city: {
        id: string;
        name: string;
        country: string;
        imageUrl?: string | null;
      };
      arrivalDate: string;
      departureDate: string;
      orderIndex: number;
      activities: Array<{
        id: string;
        name: string;
        category: string;
        description?: string | null;
        cost: number;
        durationMinutes: number;
        scheduledDate: string;
        scheduledTime?: string | null;
        imageUrl?: string | null;
      }>;
    }>;
  };
}

export interface AdminStats {
  totalUsers: number;
  totalTrips: number;
  totalCities: number;
  totalActivities: number;
  totalBudgetVolume: number;
  avgBudget: number;
  tripsByStatus: {
    draft: number;
    planned: number;
    completed: number;
  };
  signupsByMonth: Array<{
    month: string;
    signups: number;
    trips: number;
  }>;
}

export interface TopCity {
  name: string;
  country: string;
  count: number;
  imageUrl?: string | null;
}

export interface TopActivity {
  category: string;
  count: number;
  percentage: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl?: string | null;
  createdAt: string;
  _count: {
    trips: number;
  };
}
