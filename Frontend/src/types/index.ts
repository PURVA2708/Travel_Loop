export type Role = 'USER' | 'ADMIN';

export type ActivityCategory =
  | 'SIGHTSEEING'
  | 'FOOD'
  | 'ADVENTURE'
  | 'CULTURE'
  | 'NIGHTLIFE';

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

export interface City {
  id: string;
  name: string;
  country: string;
  region: string;
  description: string | null;
  costIndex: number;
  popularityScore: number;
  imageUrl: string | null;
  lat: number | null;
  lng: number | null;
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
  cost: number;
  durationMinutes: number;
  imageUrl: string | null;
  rating: number;
  city?: {
    id: string;
    name: string;
    country: string;
    region: string;
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
