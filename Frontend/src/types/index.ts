export type Role = 'user' | 'admin' | 'USER' | 'ADMIN';

export type ActivityCategory =
  | 'sightseeing'
  | 'food'
  | 'adventure'
  | 'culture'
  | 'nightlife'
  | 'SIGHTSEEING'
  | 'FOOD'
  | 'ADVENTURE'
  | 'CULTURE'
  | 'NIGHTLIFE';

export type ExpenseCategory = 'transport' | 'stay' | 'activities' | 'meals' | 'misc';

export type TripStatus = 'draft' | 'planned' | 'completed' | 'DRAFT' | 'PLANNED' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  languagePref: string;
  role: Role;
  createdAt: string;
  _count?: {
    savedDestinations?: number;
    trips?: number;
  };
}

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl: string | null;
  languagePref: string;
};

export interface City {
  id: string;
  name: string;
  country: string;
  region: string | null;
  description?: string | null;
  costIndex: number | string;
  popularityScore: number;
  imageUrl: string | null;
  lat: number | string | null;
  lng: number | string | null;
  activityCount?: number;
  isSaved?: boolean;
  activities?: Activity[];
}

export interface Activity {
  id: string;
  cityId: string;
  name: string;
  description: string | null;
  category: ActivityCategory;
  cost: number | string;
  durationMinutes: number;
  imageUrl: string | null;
  rating?: number | string;
  city?: {
    id: string;
    name: string;
    country: string;
    region?: string | null;
    costIndex?: number;
  };
}

export interface SavedDestinationItem {
  savedId: string;
  savedAt: string;
  city: City;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: Pagination;
  errors?: Array<{ field: string; message: string }>;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

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

export type TripActivity = {
  id: string;
  tripStopId: string;
  activityId: string;
  scheduledDate: string;
  scheduledTime: string | null;
  actualCost: string | number;
  orderIndex: number;
  activity: Activity;
};

export type TripStop = {
  id: string;
  tripId: string;
  cityId: string;
  arrivalDate: string;
  departureDate: string;
  orderIndex: number;
  city: City;
  activities: TripActivity[];
};

export type Trip = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  coverPhotoUrl: string | null;
  totalBudget: string | number;
  status: TripStatus;
  createdAt: string;
  stops: TripStop[];
};

export type TripSummary = Omit<Trip, 'stops'> & {
  stops: Array<{ id: string; cityId: string }>;
};

export type ItineraryDay = {
  stopId: string;
  city: City;
  arrivalDate: string;
  departureDate: string;
  activitiesByDate: Record<string, TripActivity[]>;
};

export type Itinerary = {
  tripId: string;
  name: string;
  startDate: string;
  endDate: string;
  stops: ItineraryDay[];
  totalActivityCost: number;
};
